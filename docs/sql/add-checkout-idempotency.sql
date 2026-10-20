-- orders checkout idempotency
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app.
-- Applied on the Production Supabase project blades on October 20, 2026.
-- Do not rerun it automatically. Another environment still needs its own
-- approved manual run. This note does not describe that environment.
--
-- One transaction. Any failed check or statement rolls the whole script back.
-- Checkout attempt identity only. It is not the Bank of Georgia
-- Idempotency-Key and it is not payment_provider_order_id.
-- Existing order rows stay NULL. No backfill and no data update.
-- This file does not replace create_checkout_order. On Production blades
-- that function comes from docs/sql/create-checkout-order.sql, also
-- applied on October 20, 2026. The deployed app calls the 10-argument
-- overload. BOG payment integration is not implemented.

BEGIN;

DO $$
DECLARE
  orders_oid oid;
  existing_relation_oid oid;
  existing_relkind "char";
BEGIN
  orders_oid := to_regclass('public.orders');

  IF orders_oid IS NULL THEN
    RAISE EXCEPTION 'public.orders does not exist';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'idempotency_key'
      AND (udt_name IS DISTINCT FROM 'uuid' OR is_nullable IS DISTINCT FROM 'YES')
  ) THEN
    RAISE EXCEPTION 'orders.idempotency_key already exists with a different type or nullability';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'idempotency_fingerprint'
      AND (udt_name IS DISTINCT FROM 'text' OR is_nullable IS DISTINCT FROM 'YES')
  ) THEN
    RAISE EXCEPTION 'orders.idempotency_fingerprint already exists with a different type or nullability';
  END IF;

  SELECT existing_class.oid, existing_class.relkind
  INTO existing_relation_oid, existing_relkind
  FROM pg_class existing_class
  JOIN pg_namespace existing_namespace
    ON existing_namespace.oid = existing_class.relnamespace
  WHERE existing_namespace.nspname = 'public'
    AND existing_class.relname = 'orders_idempotency_key_uidx';

  IF FOUND THEN
    IF existing_relkind IS DISTINCT FROM 'i' THEN
      RAISE EXCEPTION 'orders_idempotency_key_uidx already exists and is not an index';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_index index_row
      WHERE index_row.indexrelid = existing_relation_oid
        AND index_row.indrelid = orders_oid
        AND index_row.indisunique IS TRUE
        AND index_row.indisvalid IS TRUE
        AND index_row.indisready IS TRUE
        AND index_row.indislive IS TRUE
        AND index_row.indnkeyatts = 1
        AND index_row.indnatts = 1
        AND pg_get_indexdef(index_row.indexrelid, 1, true) = 'idempotency_key'
        AND index_row.indpred IS NOT NULL
        AND btrim(pg_get_expr(index_row.indpred, index_row.indrelid)) IN (
          'idempotency_key IS NOT NULL',
          '(idempotency_key IS NOT NULL)'
        )
    ) THEN
      RAISE EXCEPTION 'orders_idempotency_key_uidx already exists with a different definition';
    END IF;
  END IF;
END $$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key uuid;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_fingerprint text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_uidx
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN public.orders.idempotency_key IS
  'Checkout submission identity. NULL for orders created before checkout idempotency. Not a bank payment key.';

COMMENT ON COLUMN public.orders.idempotency_fingerprint IS
  'Server-derived normalized checkout request fingerprint. NULL until a future checkout RPC writes it. A repeated key with a different fingerprint is a conflict.';

COMMIT;
