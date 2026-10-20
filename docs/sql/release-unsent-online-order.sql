-- Release stock for an online checkout whose BOG Create Order was never sent.
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app. Do NOT run this until the operator approves
-- the target environment. This file does not update existing order rows.
--
-- bog_create_order_attempted defaults to false for existing rows. That matches
-- the only observed Production failure: OAuth returned HTTP 400 before
-- Create Order was sent. A row marked true means a Create Order request was
-- about to be sent, so its result may be unknown and its stock must stay reserved.
--
-- release_unsent_online_order restores stock and cancels only a pending,
-- unpaid, online order with no provider id and no Create Order attempt.
-- Paid, pending-payment, provider-linked, and already-attempted orders are
-- left unchanged. A second call does not restore stock again.
-- cancel_order and return_delivery_to_store are not replaced.

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS bog_create_order_attempted boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.orders.bog_create_order_attempted IS
  'True after this checkout is about to call BOG Create Order. False means that call has not been recorded. Stock for a false row may be released only while the order is still pending, unpaid, and has no provider id.';

CREATE OR REPLACE FUNCTION public.mark_bog_create_order_attempted(
  p_order_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_updated integer;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment:order_not_found' USING ERRCODE = 'P0001';
  END IF;

  IF v_order.payment_method IS DISTINCT FROM 'online'
     OR v_order.payment_status IS DISTINCT FROM 'unpaid'
     OR NULLIF(btrim(v_order.payment_provider_order_id), '') IS NOT NULL
     OR v_order.status IS DISTINCT FROM 'pending'
     OR COALESCE(NULLIF(btrim(v_order.payment_provider), ''), 'bog') IS DISTINCT FROM 'bog'
  THEN
    RETURN jsonb_build_object(
      'result', 'blocked',
      'order_id', v_order.id
    );
  END IF;

  IF v_order.bog_create_order_attempted THEN
    RETURN jsonb_build_object(
      'result', 'already_attempted',
      'order_id', v_order.id
    );
  END IF;

  UPDATE public.orders
  SET bog_create_order_attempted = true
  WHERE id = v_order.id
    AND payment_method = 'online'
    AND payment_status = 'unpaid'
    AND payment_provider_order_id IS NULL
    AND status = 'pending'
    AND bog_create_order_attempted = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'payment:attempt_conflict' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'result', 'attempted',
    'order_id', v_order.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.mark_bog_create_order_attempted(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_bog_create_order_attempted(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_bog_create_order_attempted(uuid) TO service_role;

COMMENT ON FUNCTION public.mark_bog_create_order_attempted(uuid) IS
  'Records that BOG Create Order is about to be called. Does not change stock, payment status, or call the bank.';

CREATE OR REPLACE FUNCTION public.release_unsent_online_order(
  p_order_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item_count integer;
  v_updated integer;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment:order_not_found' USING ERRCODE = 'P0001';
  END IF;

  IF v_order.payment_method IS DISTINCT FROM 'online'
     OR v_order.payment_status IS DISTINCT FROM 'unpaid'
     OR NULLIF(btrim(v_order.payment_provider_order_id), '') IS NOT NULL
     OR v_order.bog_create_order_attempted
     OR COALESCE(NULLIF(btrim(v_order.payment_provider), ''), 'bog') IS DISTINCT FROM 'bog'
  THEN
    RETURN jsonb_build_object(
      'result', 'blocked',
      'order_id', v_order.id
    );
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'result', 'already_released',
      'order_id', v_order.id
    );
  END IF;

  IF v_order.status IS DISTINCT FROM 'pending' THEN
    RETURN jsonb_build_object(
      'result', 'blocked',
      'order_id', v_order.id
    );
  END IF;

  PERFORM 1
  FROM public.products AS product
  WHERE product.id IN (
    SELECT DISTINCT item.product_id
    FROM public.order_items AS item
    WHERE item.order_id = v_order.id
      AND item.product_id IS NOT NULL
  )
  ORDER BY product.id
  FOR UPDATE OF product;

  SELECT COUNT(*)
  INTO v_item_count
  FROM (
    SELECT item.product_id
    FROM public.order_items AS item
    WHERE item.order_id = v_order.id
      AND item.product_id IS NOT NULL
    GROUP BY item.product_id
  ) AS grouped_items;

  IF v_item_count = 0 THEN
    RAISE EXCEPTION 'payment:release_incomplete' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.products AS product
  SET stock = product.stock + requested.quantity
  FROM (
    SELECT item.product_id,
           SUM(item.quantity)::integer AS quantity
    FROM public.order_items AS item
    WHERE item.order_id = v_order.id
      AND item.product_id IS NOT NULL
    GROUP BY item.product_id
  ) AS requested
  WHERE product.id = requested.product_id
    AND product.stock IS NOT NULL
    AND requested.quantity > 0;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated <> v_item_count THEN
    RAISE EXCEPTION 'payment:release_incomplete' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.orders
  SET status = 'cancelled'
  WHERE id = v_order.id
    AND status = 'pending'
    AND payment_method = 'online'
    AND payment_status = 'unpaid'
    AND payment_provider_order_id IS NULL
    AND bog_create_order_attempted = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'payment:release_conflict' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'result', 'released',
    'order_id', v_order.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.release_unsent_online_order(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_unsent_online_order(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_unsent_online_order(uuid) TO service_role;

COMMENT ON FUNCTION public.release_unsent_online_order(uuid) IS
  'Restores stock and cancels one pending unpaid online order that has no BOG provider id and no recorded Create Order attempt. Does not call the bank, does not mark the order paid, and does not restore stock twice.';

COMMIT;
