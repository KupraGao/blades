-- Home Latest YouTube Videos — public.youtube_latest_videos_cache
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app.
-- EXECUTED in the Supabase SQL Editor (history). The live table already exists.
-- Do NOT re-run unless documenting a fresh environment.
--
-- Persistent fallback snapshot for the Home YouTube section.
-- RSS remains the primary source. This table is NOT CMS, customer, or order data.
-- Application access is server-side only via createAdminClient()
-- (privileged / service-role). No INSERT of video rows in this history file.

-- ============================================================
-- TABLE
-- ============================================================

CREATE TABLE public.youtube_latest_videos_cache (
  id text PRIMARY KEY,
  videos jsonb NOT NULL,
  fetched_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT youtube_latest_videos_cache_videos_array_check
    CHECK (jsonb_typeof(videos) = 'array'),

  CONSTRAINT youtube_latest_videos_cache_videos_length_check
    CHECK (jsonb_array_length(videos) BETWEEN 1 AND 3)
);

COMMENT ON TABLE public.youtube_latest_videos_cache IS
  'Last successful Home YouTube RSS snapshot (1–3 videos). Singleton id bladesge. Not CMS.';

COMMENT ON COLUMN public.youtube_latest_videos_cache.id IS
  'Singleton key. Application uses bladesge.';

COMMENT ON COLUMN public.youtube_latest_videos_cache.videos IS
  'JSON array of LatestYoutubeVideo objects (videoId, title, published, url, thumbnail).';

-- ============================================================
-- RLS / GRANTS
-- anon / authenticated: no table access.
-- Reads and writes: privileged server client only.
-- ============================================================

ALTER TABLE public.youtube_latest_videos_cache
ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.youtube_latest_videos_cache
FROM anon, authenticated;
