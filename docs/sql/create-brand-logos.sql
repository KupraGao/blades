-- Brand logos — storage.brand-logos
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app.
-- NOT yet executed until applied in the SQL Editor.
--
-- Public READ only. Stored files are optimized WebP, at most 2 MB.
-- No INSERT / UPDATE / DELETE grant for anon or authenticated.
-- Admin uploads use the privileged server client (service_role), which
-- bypasses storage RLS. This script does not grant that role anything new.

-- ============================================================
-- STORAGE BUCKET
-- Dedicated bucket so product-images and promo-banners stay isolated.
-- Re-running updates only this bucket's read flag, size, and MIME list.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-logos',
  'brand-logos',
  true,
  2097152,
  ARRAY['image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- STORAGE POLICIES
-- SELECT is the only permission added.
-- Restrictive policies add a deny for anon/authenticated writes on
-- this bucket. They do not allow writes anywhere else.
-- ============================================================

DROP POLICY IF EXISTS brand_logos_public_read ON storage.objects;
DROP POLICY IF EXISTS brand_logos_no_anon_authenticated_insert ON storage.objects;
DROP POLICY IF EXISTS brand_logos_no_anon_authenticated_update ON storage.objects;
DROP POLICY IF EXISTS brand_logos_no_anon_authenticated_delete ON storage.objects;

CREATE POLICY brand_logos_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'brand-logos');

CREATE POLICY brand_logos_no_anon_authenticated_insert
  ON storage.objects
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id IS DISTINCT FROM 'brand-logos');

CREATE POLICY brand_logos_no_anon_authenticated_update
  ON storage.objects
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id IS DISTINCT FROM 'brand-logos')
  WITH CHECK (bucket_id IS DISTINCT FROM 'brand-logos');

CREATE POLICY brand_logos_no_anon_authenticated_delete
  ON storage.objects
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id IS DISTINCT FROM 'brand-logos');
