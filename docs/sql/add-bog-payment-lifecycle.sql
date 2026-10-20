-- BOG payment lifecycle safety.
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app. Do NOT run this on Production until the
-- operator explicitly approves that environment.
--
-- One transaction. A failed statement rolls the whole script back.
-- Existing order rows are not updated. cancel_order and
-- return_delivery_to_store are not replaced. Their Production definitions
-- are not in this repository. Confirmed Production MD5 values, for the
-- operator's comparison only, are:
--   cancel_order: 69efa557c03975d0acce40378ff7ce02
--   return_delivery_to_store: 522f9bffa5a2cfa34ddb5f54901fa6e2
--
-- The new BEFORE UPDATE triggers abort an unsafe status change. That abort
-- protects stock only when the existing function does not catch and ignore
-- the exception. This script cannot see that function body.
--
-- paid is written only by apply_bog_payment_receipt. A browser redirect or
-- a callback body is not an input to this script.
-- rejected is recorded and does not change payment_status or stock.
-- The Bank of Georgia payment-details page does not say that rejected can
-- never later become completed.

BEGIN;

DO $$
DECLARE
  orders_oid oid;
  existing_index_oid oid;
  existing_relkind "char";
  duplicate_count bigint;
  events_oid oid;
  events_relkind "char";
BEGIN
  orders_oid := to_regclass('public.orders');

  IF orders_oid IS NULL THEN
    RAISE EXCEPTION 'public.orders does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'payment_provider_order_id'
      AND udt_name = 'text'
      AND is_nullable = 'YES'
  ) THEN
    RAISE EXCEPTION 'orders.payment_provider_order_id must be nullable text';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'payment_status'
      AND udt_name = 'text'
      AND is_nullable = 'NO'
  ) THEN
    RAISE EXCEPTION 'orders.payment_status must be NOT NULL text';
  END IF;

  SELECT count(*)
  INTO duplicate_count
  FROM (
    SELECT payment_provider_order_id
    FROM public.orders
    WHERE payment_provider_order_id IS NOT NULL
    GROUP BY payment_provider_order_id
    HAVING count(*) > 1
  ) AS duplicates;

  IF duplicate_count <> 0 THEN
    RAISE EXCEPTION 'orders.payment_provider_order_id has duplicate values';
  END IF;

  SELECT existing_class.oid, existing_class.relkind
  INTO existing_index_oid, existing_relkind
  FROM pg_class AS existing_class
  JOIN pg_namespace AS existing_namespace
    ON existing_namespace.oid = existing_class.relnamespace
  WHERE existing_namespace.nspname = 'public'
    AND existing_class.relname = 'orders_payment_provider_order_id_uidx';

  IF FOUND THEN
    IF existing_relkind IS DISTINCT FROM 'i' THEN
      RAISE EXCEPTION 'orders_payment_provider_order_id_uidx already exists and is not an index';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_index AS index_row
      WHERE index_row.indexrelid = existing_index_oid
        AND index_row.indrelid = orders_oid
        AND index_row.indisunique IS TRUE
        AND index_row.indisvalid IS TRUE
        AND index_row.indisready IS TRUE
        AND index_row.indislive IS TRUE
        AND index_row.indnkeyatts = 1
        AND index_row.indnatts = 1
        AND pg_get_indexdef(index_row.indexrelid, 1, true) = 'payment_provider_order_id'
        AND index_row.indpred IS NOT NULL
        AND btrim(pg_get_expr(index_row.indpred, index_row.indrelid)) IN (
          'payment_provider_order_id IS NOT NULL',
          '(payment_provider_order_id IS NOT NULL)'
        )
    ) THEN
      RAISE EXCEPTION 'orders_payment_provider_order_id_uidx already exists with a different definition';
    END IF;
  END IF;

  SELECT existing_class.oid, existing_class.relkind
  INTO events_oid, events_relkind
  FROM pg_class AS existing_class
  JOIN pg_namespace AS existing_namespace
    ON existing_namespace.oid = existing_class.relnamespace
  WHERE existing_namespace.nspname = 'public'
    AND existing_class.relname = 'payment_events';

  IF FOUND AND events_relkind IS DISTINCT FROM 'r' THEN
    RAISE EXCEPTION 'public.payment_events already exists and is not a table';
  END IF;

  IF events_oid IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = events_oid
      AND conname = 'payment_events_receipt_uidx'
      AND contype = 'u'
  ) THEN
    RAISE EXCEPTION 'public.payment_events exists without payment_events_receipt_uidx';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_provider_order_id_uidx
  ON public.orders (payment_provider_order_id)
  WHERE payment_provider_order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id),
  provider text NOT NULL,
  provider_order_id text NOT NULL,
  external_order_id text NOT NULL,
  receipt_status text NOT NULL,
  request_amount text NOT NULL,
  transfer_amount text NOT NULL,
  refund_amount text NOT NULL,
  currency_code text NOT NULL,
  reject_reason text NULL,
  disposition text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_events_provider_bog CHECK (provider = 'bog'),
  CONSTRAINT payment_events_disposition_known CHECK (
    disposition IN (
      'applied_paid',
      'already_paid',
      'quarantine_late_completed',
      'provider_order_mismatch',
      'provider_order_missing',
      'identity_mismatch',
      'amount_mismatch',
      'currency_mismatch',
      'method_mismatch',
      'provider_rejected',
      'observed_refund',
      'observed',
      'unknown_status',
      'contradictory_state'
    )
  ),
  CONSTRAINT payment_events_receipt_uidx UNIQUE (
    provider,
    provider_order_id,
    external_order_id,
    receipt_status,
    request_amount,
    transfer_amount,
    refund_amount,
    currency_code
  )
);

CREATE INDEX IF NOT EXISTS payment_events_order_id_idx
  ON public.payment_events (order_id);

COMMENT ON TABLE public.payment_events IS
  'Append-only BOG receipt observations. A repeated fingerprint does not change the order again.';

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_events FROM PUBLIC;
REVOKE ALL ON TABLE public.payment_events FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.payment_events TO service_role;

CREATE OR REPLACE FUNCTION public.prevent_unpaid_online_fulfillment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.payment_method = 'online'
     AND OLD.payment_status IS DISTINCT FROM 'paid'
     AND NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN (
       'confirmed',
       'processing',
       'shipped',
       'ready_for_pickup',
       'completed',
       'delivery_failed'
     )
  THEN
    RAISE EXCEPTION 'payment:unpaid_online_fulfillment' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_prevent_unpaid_online_fulfillment ON public.orders;

CREATE TRIGGER orders_prevent_unpaid_online_fulfillment
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.prevent_unpaid_online_fulfillment();

COMMENT ON FUNCTION public.prevent_unpaid_online_fulfillment() IS
  'Blocks a new fulfillment status for an online order that is not already paid. pay_at_pickup and NULL payment_method are unchanged. Existing rows are not rewritten.';

CREATE OR REPLACE FUNCTION public.prevent_unsafe_online_cancel()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.payment_method = 'online'
     AND NEW.status = 'cancelled'
     AND OLD.status IS DISTINCT FROM 'cancelled'
     AND (
       OLD.payment_status IN ('pending', 'paid', 'refund_pending', 'refunded')
       OR NULLIF(btrim(OLD.payment_provider_order_id), '') IS NOT NULL
     )
  THEN
    RAISE EXCEPTION 'payment:online_cancel_blocked' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_prevent_unsafe_online_cancel ON public.orders;

CREATE TRIGGER orders_prevent_unsafe_online_cancel
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.prevent_unsafe_online_cancel();

COMMENT ON FUNCTION public.prevent_unsafe_online_cancel() IS
  'Blocks cancel_order from marking an in-progress or paid online order cancelled. The existing cancel function is not replaced. pay_at_pickup is unchanged.';

CREATE OR REPLACE FUNCTION public.attach_bog_provider_order(
  p_order_id uuid,
  p_provider_order_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_provider_order_id text;
BEGIN
  v_provider_order_id := btrim(COALESCE(p_provider_order_id, ''));

  IF v_provider_order_id !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$' THEN
    RAISE EXCEPTION 'payment:invalid_provider_order_id' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment:order_not_found' USING ERRCODE = 'P0001';
  END IF;

  IF v_order.payment_method IS DISTINCT FROM 'online' THEN
    RAISE EXCEPTION 'payment:not_online' USING ERRCODE = 'P0001';
  END IF;

  IF v_order.status IN ('cancelled', 'returned_to_store') THEN
    RAISE EXCEPTION 'payment:order_closed' USING ERRCODE = 'P0001';
  END IF;

  IF NULLIF(btrim(v_order.payment_provider_order_id), '') IS NOT NULL THEN
    IF btrim(v_order.payment_provider_order_id) = v_provider_order_id THEN
      RETURN jsonb_build_object(
        'result', 'already_attached',
        'order_id', v_order.id,
        'payment_status', v_order.payment_status
      );
    END IF;

    RAISE EXCEPTION 'payment:provider_order_conflict' USING ERRCODE = 'P0001';
  END IF;

  IF v_order.payment_status IS DISTINCT FROM 'unpaid' THEN
    RAISE EXCEPTION 'payment:not_unpaid' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.orders
  SET payment_provider = 'bog',
      payment_provider_order_id = v_provider_order_id,
      payment_status = 'pending'
  WHERE id = v_order.id
    AND payment_method = 'online'
    AND payment_status = 'unpaid'
    AND payment_provider_order_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment:attach_conflict' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'result', 'attached',
    'order_id', v_order.id,
    'payment_status', 'pending'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.attach_bog_provider_order(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.attach_bog_provider_order(uuid, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_bog_provider_order(uuid, text) TO service_role;

COMMENT ON FUNCTION public.attach_bog_provider_order(uuid, text) IS
  'Binds one BOG order id to an unpaid online order and marks payment pending. Does not call the bank and does not change stock.';

CREATE OR REPLACE FUNCTION public.apply_bog_payment_receipt(
  p_order_id uuid,
  p_provider_order_id text,
  p_external_order_id text,
  p_receipt_status text,
  p_request_amount text,
  p_transfer_amount text,
  p_refund_amount text,
  p_currency_code text,
  p_reject_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_provider_order_id text;
  v_external_order_id text;
  v_receipt_status text;
  v_request_amount text;
  v_transfer_amount text;
  v_refund_amount text;
  v_currency_code text;
  v_disposition text;
  v_event_id uuid;
  v_updated integer;
BEGIN
  v_provider_order_id := btrim(COALESCE(p_provider_order_id, ''));
  v_external_order_id := btrim(COALESCE(p_external_order_id, ''));
  v_receipt_status := btrim(COALESCE(p_receipt_status, ''));
  v_request_amount := btrim(COALESCE(p_request_amount, ''));
  v_transfer_amount := btrim(COALESCE(p_transfer_amount, ''));
  v_refund_amount := btrim(COALESCE(p_refund_amount, ''));
  v_currency_code := btrim(COALESCE(p_currency_code, ''));

  IF v_provider_order_id !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$'
     OR v_external_order_id = ''
     OR v_receipt_status = ''
     OR v_request_amount !~ '^(?:0|[1-9]\d*)(?:\.\d+)?$'
     OR v_transfer_amount !~ '^(?:0|[1-9]\d*)(?:\.\d+)?$'
     OR v_refund_amount !~ '^(?:0|[1-9]\d*)(?:\.\d+)?$'
     OR v_currency_code !~ '^[A-Z]{3}$'
  THEN
    RAISE EXCEPTION 'payment:invalid_receipt' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment:order_not_found' USING ERRCODE = 'P0001';
  END IF;

  IF lower(v_external_order_id) IS DISTINCT FROM lower(v_order.id::text) THEN
    v_disposition := 'identity_mismatch';
  ELSIF NULLIF(btrim(v_order.payment_provider_order_id), '') IS NULL THEN
    v_disposition := 'provider_order_missing';
  ELSIF btrim(v_order.payment_provider_order_id) IS DISTINCT FROM v_provider_order_id THEN
    v_disposition := 'provider_order_mismatch';
  ELSIF v_receipt_status = 'completed'
        AND v_order.status IN ('cancelled', 'returned_to_store') THEN
    v_disposition := 'quarantine_late_completed';
  ELSIF v_receipt_status = 'completed'
        AND v_order.payment_method IS DISTINCT FROM 'online' THEN
    v_disposition := 'method_mismatch';
  ELSIF v_receipt_status = 'completed'
        AND v_currency_code IS DISTINCT FROM 'GEL' THEN
    v_disposition := 'currency_mismatch';
  ELSIF v_receipt_status = 'completed'
        AND (
          v_request_amount::numeric IS DISTINCT FROM v_order.total_price
          OR v_transfer_amount::numeric IS DISTINCT FROM v_request_amount::numeric
        ) THEN
    v_disposition := 'amount_mismatch';
  ELSIF v_receipt_status = 'completed'
        AND v_order.payment_status = 'paid' THEN
    v_disposition := 'already_paid';
  ELSIF v_receipt_status = 'completed'
        AND v_order.payment_status IN ('unpaid', 'pending') THEN
    v_disposition := 'applied_paid';
  ELSIF v_receipt_status = 'completed' THEN
    v_disposition := 'contradictory_state';
  ELSIF v_receipt_status = 'rejected' THEN
    v_disposition := 'provider_rejected';
  ELSIF v_receipt_status IN ('refund_requested', 'refunded', 'refunded_partially') THEN
    v_disposition := 'observed_refund';
  ELSIF v_receipt_status IN (
    'created',
    'processing',
    'auth_requested',
    'blocked',
    'partial_completed'
  ) THEN
    v_disposition := 'observed';
  ELSE
    v_disposition := 'unknown_status';
  END IF;

  INSERT INTO public.payment_events (
    order_id,
    provider,
    provider_order_id,
    external_order_id,
    receipt_status,
    request_amount,
    transfer_amount,
    refund_amount,
    currency_code,
    reject_reason,
    disposition
  )
  VALUES (
    v_order.id,
    'bog',
    v_provider_order_id,
    v_external_order_id,
    v_receipt_status,
    v_request_amount,
    v_transfer_amount,
    v_refund_amount,
    v_currency_code,
    NULLIF(btrim(COALESCE(p_reject_reason, '')), ''),
    v_disposition
  )
  ON CONFLICT ON CONSTRAINT payment_events_receipt_uidx DO NOTHING
  RETURNING id INTO v_event_id;

  IF v_event_id IS NULL THEN
    RETURN jsonb_build_object(
      'result', 'already_recorded',
      'order_id', v_order.id,
      'payment_status', v_order.payment_status
    );
  END IF;

  IF v_disposition = 'applied_paid' THEN
    UPDATE public.orders
    SET payment_status = 'paid',
        paid_at = COALESCE(paid_at, now()),
        payment_provider = 'bog'
    WHERE id = v_order.id
      AND payment_method = 'online'
      AND payment_status IN ('unpaid', 'pending')
      AND payment_provider_order_id = v_provider_order_id
      AND status IS DISTINCT FROM 'cancelled'
      AND status IS DISTINCT FROM 'returned_to_store';

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated <> 1 THEN
      RAISE EXCEPTION 'payment:paid_update_conflict' USING ERRCODE = 'P0001';
    END IF;

    RETURN jsonb_build_object(
      'result', 'applied_paid',
      'order_id', v_order.id,
      'payment_status', 'paid',
      'event_id', v_event_id
    );
  END IF;

  RETURN jsonb_build_object(
    'result', v_disposition,
    'order_id', v_order.id,
    'payment_status', v_order.payment_status,
    'event_id', v_event_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_bog_payment_receipt(
  uuid, text, text, text, text, text, text, text, text
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.apply_bog_payment_receipt(
  uuid, text, text, text, text, text, text, text, text
) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.apply_bog_payment_receipt(
  uuid, text, text, text, text, text, text, text, text
) TO service_role;

COMMENT ON FUNCTION public.apply_bog_payment_receipt(
  uuid, text, text, text, text, text, text, text, text
) IS
  'Records one server-supplied BOG receipt and marks paid only when identity, GEL, request amount, transfer amount, and completed all match. Does not change stock.';

COMMIT;
