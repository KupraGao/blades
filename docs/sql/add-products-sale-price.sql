-- products.sale_price
-- Manual execution in the Supabase SQL Editor.
-- Does not backfill sale prices. Existing rows stay sale_price = NULL.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_price numeric;

COMMENT ON COLUMN public.products.sale_price IS
  'Optional discounted selling price. NULL = not on sale. When set: > 0 and < price.';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_sale_price_valid;

ALTER TABLE public.products
  ADD CONSTRAINT products_sale_price_valid
  CHECK (
    sale_price IS NULL
    OR (
      sale_price > 0
      AND sale_price < price
    )
  );
