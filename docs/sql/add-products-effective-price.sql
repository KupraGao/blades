-- products.effective_price
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app.
-- NOT yet executed until applied in the SQL Editor.
--
-- Derived catalog selling price for filter/sort/pagination:
--   COALESCE(sale_price, price)
-- Read-only generated column. Not Admin-editable.
-- Does not rewrite price, sale_price, or order history.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS effective_price numeric
  GENERATED ALWAYS AS (COALESCE(sale_price, price)) STORED;

COMMENT ON COLUMN public.products.effective_price IS
  'Generated catalog selling price: COALESCE(sale_price, price). Query/index surface only. Not an editable source field.';

CREATE INDEX IF NOT EXISTS products_effective_price_idx
  ON public.products (effective_price);
