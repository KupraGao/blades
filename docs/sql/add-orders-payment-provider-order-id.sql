-- orders.payment_provider_order_id
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app.
-- EXECUTED in the Supabase SQL Editor (history).
--
-- Provider-neutral payment/order-request identifier (e.g. BOG order_id).
-- Distinct from payment_transaction_id (final provider transaction id).
-- Existing rows remain NULL. No backfill. No index. No extra constraints.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_provider_order_id text;

COMMENT ON COLUMN public.orders.payment_provider_order_id IS
  'Provider payment/order-request identifier (e.g. BOG order_id). NULL until a provider session exists. Distinct from payment_transaction_id.';
