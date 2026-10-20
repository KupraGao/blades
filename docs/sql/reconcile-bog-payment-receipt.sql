-- BOG payment reconciliation.
-- Manual execution in the Supabase SQL Editor after operator review.
-- Do NOT auto-run from the app. This task does not execute this file.
--
-- The BOG-03 unique key treated one receipt as one row, regardless of
-- disposition. A completed receipt recorded as provider_order_missing
-- then blocked a later applied_paid insert of that same receipt.
--
-- This migration keeps every original observation. The unique key also
-- includes disposition, so a later eligible outcome can be inserted once.
-- apply_bog_payment_receipt already calculates the disposition before
-- insert and marks paid only inside its existing applied_paid update.
-- ON CONFLICT ON CONSTRAINT follows the replaced key: the same
-- disposition is still already_recorded, and stock is not changed.
--
-- cancel_order and return_delivery_to_store are not replaced.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.payment_events') IS NULL THEN
    RAISE EXCEPTION 'public.payment_events does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.payment_events'::regclass
      AND conname = 'payment_events_receipt_uidx'
      AND contype = 'u'
  ) THEN
    RAISE EXCEPTION 'payment_events_receipt_uidx is missing';
  END IF;
END $$;

ALTER TABLE public.payment_events
  DROP CONSTRAINT payment_events_receipt_uidx;

ALTER TABLE public.payment_events
  ADD CONSTRAINT payment_events_receipt_uidx UNIQUE (
    provider,
    provider_order_id,
    external_order_id,
    receipt_status,
    request_amount,
    transfer_amount,
    refund_amount,
    currency_code,
    disposition
  );

COMMENT ON CONSTRAINT payment_events_receipt_uidx ON public.payment_events IS
  'One stored outcome per BOG receipt. A different disposition of the same receipt can be recorded later and can still mark an eligible order paid.';

COMMENT ON FUNCTION public.apply_bog_payment_receipt(
  uuid, text, text, text, text, text, text, text, text
) IS
  'Records one server-supplied BOG receipt outcome. The same disposition is not applied twice. A newly eligible completed disposition marks paid only when identity, GEL, request amount, transfer amount, provider order, and order eligibility match. Does not change stock.';

COMMIT;
