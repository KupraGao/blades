-- Promo Slider #1 — public.promo_banners + storage.promo-banners
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app.
-- NOT yet executed until applied in the SQL Editor.
--
-- Homepage Promo Slider #1 CMS. Image-first posters.
-- price / sale_price / effective_price / orders are unchanged.

-- ============================================================
-- TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path text NOT NULL,
  title_ka text NULL,
  title_en text NULL,
  subtitle_ka text NULL,
  subtitle_en text NULL,
  link_url text NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_banners_link_url_internal
    CHECK (
      link_url IS NULL
      OR (
        char_length(btrim(link_url)) > 0
        AND link_url LIKE '/%'
        AND link_url NOT LIKE '//%'
      )
    )
);

COMMENT ON TABLE public.promo_banners IS
  'Homepage Promo Slider #1 banners. Image required. Title/subtitle/link optional.';

COMMENT ON COLUMN public.promo_banners.image_path IS
  'Storage object key in the promo-banners bucket. Not a full public URL.';

COMMENT ON COLUMN public.promo_banners.link_url IS
  'Optional internal app path (must start with a single /). NULL = not clickable.';

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS promo_banners_admin_order_idx
  ON public.promo_banners (sort_order ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS promo_banners_storefront_active_idx
  ON public.promo_banners (sort_order ASC, created_at ASC)
  WHERE is_active = true;

-- ============================================================
-- UPDATED_AT (BEFORE UPDATE, same style as profiles)
-- ============================================================

CREATE OR REPLACE FUNCTION public.promo_banners_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS promo_banners_set_updated_at ON public.promo_banners;

CREATE TRIGGER promo_banners_set_updated_at
  BEFORE UPDATE ON public.promo_banners
  FOR EACH ROW
  EXECUTE PROCEDURE public.promo_banners_set_updated_at();

-- ============================================================
-- GRANTS / RLS
-- Public may SELECT active rows only.
-- INSERT / UPDATE / DELETE: service_role only (Admin CMS after requireAdmin()).
-- ============================================================

ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.promo_banners FROM PUBLIC;
REVOKE ALL ON TABLE public.promo_banners FROM anon;
REVOKE ALL ON TABLE public.promo_banners FROM authenticated;

GRANT SELECT ON TABLE public.promo_banners TO anon;
GRANT SELECT ON TABLE public.promo_banners TO authenticated;
GRANT ALL ON TABLE public.promo_banners TO service_role;

DROP POLICY IF EXISTS promo_banners_public_select_active ON public.promo_banners;

CREATE POLICY promo_banners_public_select_active
  ON public.promo_banners
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- ============================================================
-- STORAGE BUCKET
-- Dedicated bucket so product-images lifecycle stays isolated.
-- Public READ; no anonymous/authenticated write policies.
-- Admin uploads use the privileged server client (service_role).
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'promo-banners',
  'promo-banners',
  true,
  2097152,
  ARRAY['image/webp', 'image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS promo_banners_public_read ON storage.objects;
DROP POLICY IF EXISTS promo_banners_no_public_insert ON storage.objects;
DROP POLICY IF EXISTS promo_banners_no_public_update ON storage.objects;
DROP POLICY IF EXISTS promo_banners_no_public_delete ON storage.objects;

CREATE POLICY promo_banners_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'promo-banners');
