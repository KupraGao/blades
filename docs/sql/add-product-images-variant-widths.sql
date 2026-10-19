-- product_images.variant_widths
-- Manual execution in the Supabase SQL Editor.
-- Do NOT run from the app. This file was not executed by the change that added it.
--
-- Existing rows keep an empty array, so the storefront continues to use the Master
-- until a variant upload confirms a width. Allowed widths: 128, 384, 768, 1280.
-- Duplicates are rejected. RLS policies are not changed.
-- The functions are service_role only. They lock the row for the duration of
-- one UPDATE, so concurrent confirmed uploads cannot drop each other's widths.
-- variant_writes_blocked starts false. Delete sets it true and clears widths
-- before any storage delete. Append updates a row only while the flag is false.

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS variant_widths integer[] DEFAULT '{}';

UPDATE public.product_images
SET variant_widths = '{}'::integer[]
WHERE variant_widths IS NULL;

ALTER TABLE public.product_images
  ALTER COLUMN variant_widths SET DEFAULT '{}'::integer[],
  ALTER COLUMN variant_widths SET NOT NULL;

COMMENT ON COLUMN public.product_images.variant_widths IS
  'Confirmed responsive WebP widths for this master. Empty means Master only.';

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS variant_writes_blocked boolean DEFAULT false;

UPDATE public.product_images
SET variant_writes_blocked = false
WHERE variant_writes_blocked IS NULL;

ALTER TABLE public.product_images
  ALTER COLUMN variant_writes_blocked SET DEFAULT false,
  ALTER COLUMN variant_writes_blocked SET NOT NULL;

COMMENT ON COLUMN public.product_images.variant_writes_blocked IS
  'When true, confirmed variant widths cannot be added. Delete sets this before storage objects are removed.';


CREATE OR REPLACE FUNCTION public.product_image_variant_widths_valid(widths integer[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT widths IS NOT NULL
    AND array_position(widths, NULL) IS NULL
    AND widths <@ ARRAY[128, 384, 768, 1280]::integer[]
    AND cardinality(widths) = (
      SELECT count(DISTINCT width)
      FROM unnest(widths) AS width
    );
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_images_variant_widths_allowed'
      AND conrelid = 'public.product_images'::regclass
  ) THEN
    ALTER TABLE public.product_images
      ADD CONSTRAINT product_images_variant_widths_allowed
      CHECK (public.product_image_variant_widths_valid(variant_widths));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.append_product_image_variant_width(
  target_product_id text,
  target_image_id text,
  target_width integer
)
RETURNS integer[]
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  updated integer[];
BEGIN
  IF target_width IS NULL OR target_width NOT IN (128, 384, 768, 1280) THEN
    RAISE EXCEPTION 'invalid_variant_width';
  END IF;

  UPDATE public.product_images
  SET variant_widths = (
    SELECT COALESCE(array_agg(DISTINCT width ORDER BY width), '{}'::integer[])
    FROM unnest(COALESCE(variant_widths, '{}'::integer[]) || ARRAY[target_width]) AS width
    WHERE width IN (128, 384, 768, 1280)
  )
  WHERE id::text = target_image_id
    AND product_id::text = target_product_id
    AND variant_writes_blocked = false
  RETURNING variant_widths INTO updated;

  IF FOUND THEN
    RETURN updated;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.product_images
    WHERE id::text = target_image_id
      AND product_id::text = target_product_id
  ) THEN
    RAISE EXCEPTION 'image_not_found';
  END IF;

  RAISE EXCEPTION 'writes_blocked';
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_product_image_variant_width(
  target_product_id text,
  target_image_id text,
  target_width integer
)
RETURNS integer[]
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  updated integer[];
BEGIN
  IF target_width IS NULL OR target_width NOT IN (128, 384, 768, 1280) THEN
    RAISE EXCEPTION 'invalid_variant_width';
  END IF;

  UPDATE public.product_images
  SET variant_writes_blocked = true,
      variant_widths = (
    SELECT COALESCE(array_agg(DISTINCT width ORDER BY width), '{}'::integer[])
    FROM unnest(COALESCE(variant_widths, '{}'::integer[])) AS width
    WHERE width IN (128, 384, 768, 1280)
      AND width <> target_width
  )
  WHERE id::text = target_image_id
    AND product_id::text = target_product_id
  RETURNING variant_widths INTO updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'image_not_found';
  END IF;

  RETURN updated;
END;
$$;

REVOKE ALL ON FUNCTION public.product_image_variant_widths_valid(integer[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.product_image_variant_widths_valid(integer[]) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.product_image_variant_widths_valid(integer[]) TO service_role;

REVOKE ALL ON FUNCTION public.append_product_image_variant_width(text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.append_product_image_variant_width(text, text, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.append_product_image_variant_width(text, text, integer) TO service_role;

REVOKE ALL ON FUNCTION public.remove_product_image_variant_width(text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_product_image_variant_width(text, text, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_product_image_variant_width(text, text, integer) TO service_role;
