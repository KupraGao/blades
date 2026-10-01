-- product_images.sort_order
-- Manual execution in the Supabase SQL Editor.
-- Do NOT run from the app. Presentation order only; is_main is unchanged.
--
-- No DEFAULT: every insert path sets sort_order explicitly. DEFAULT 0 would
-- collide with the main-image invariant (sort_order = 0).
--
-- No UNIQUE (product_id, sort_order): Admin reorder/resequence updates rows
-- sequentially. A UNIQUE constraint would make those updates fail unless every
-- algorithm uses a two-phase offset. The btree index below is enough for
-- ordered reads. Application code maintains 0..N per product.

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS sort_order integer;

COMMENT ON COLUMN public.product_images.sort_order IS
  'Gallery presentation order per product. 0 = main image. Remaining images 1..N.';

-- Backfill: current main first (sort_order 0), then remaining rows by
-- created_at ASC (upload chronology; NULLS LAST), then id ASC as tie-breaker.
WITH ranked AS (
  SELECT
    id,
    (
      row_number() OVER (
        PARTITION BY product_id
        ORDER BY (is_main IS TRUE) DESC, created_at ASC NULLS LAST, id ASC
      ) - 1
    )::integer AS next_order
  FROM public.product_images
)
UPDATE public.product_images AS images
SET sort_order = ranked.next_order
FROM ranked
WHERE images.id = ranked.id;

ALTER TABLE public.product_images
  ALTER COLUMN sort_order SET NOT NULL;

CREATE INDEX IF NOT EXISTS product_images_product_id_sort_order_idx
  ON public.product_images (product_id ASC, sort_order ASC);
