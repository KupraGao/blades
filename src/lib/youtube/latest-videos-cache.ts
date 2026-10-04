import { createAdminClient } from "@/lib/supabase/admin";
import type { LatestYoutubeVideo } from "@/lib/youtube/fetch-latest-videos";

const CACHE_TABLE = "youtube_latest_videos_cache";
const CACHE_ID = "bladesge";
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const MIN_VIDEOS = 1;
const MAX_VIDEOS = 3;

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("YouTube latest-videos cache can only be used on the server.");
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseCachedVideo(value: unknown): LatestYoutubeVideo | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.videoId !== "string" ||
    !YOUTUBE_VIDEO_ID_PATTERN.test(item.videoId)
  ) {
    return null;
  }

  if (!isNonEmptyString(item.title)) {
    return null;
  }

  if (!isNonEmptyString(item.published)) {
    return null;
  }

  if (!isNonEmptyString(item.url)) {
    return null;
  }

  if (!isNonEmptyString(item.thumbnail)) {
    return null;
  }

  return {
    videoId: item.videoId,
    title: item.title.trim(),
    published: item.published.trim(),
    url: item.url.trim(),
    thumbnail: item.thumbnail.trim(),
  };
}

export function parseLatestYoutubeVideosCache(
  value: unknown,
): LatestYoutubeVideo[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length < MIN_VIDEOS || value.length > MAX_VIDEOS) {
    return null;
  }

  const videos: LatestYoutubeVideo[] = [];

  for (const item of value) {
    const video = parseCachedVideo(item);

    if (!video) {
      return null;
    }

    videos.push(video);
  }

  return videos;
}

export async function readLatestYoutubeVideosCache(): Promise<
  LatestYoutubeVideo[]
> {
  assertServerOnly();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(CACHE_TABLE)
      .select("videos")
      .eq("id", CACHE_ID)
      .maybeSingle();

    if (error) {
      console.error("[YouTube cache] Read failed", {
        code: error.code ?? null,
        message: error.message ?? null,
      });
      return [];
    }

    if (!data) {
      return [];
    }

    return parseLatestYoutubeVideosCache(data.videos) ?? [];
  } catch (error) {
    console.error("[YouTube cache] Read failed", error);
    return [];
  }
}

export async function writeLatestYoutubeVideosCache(
  videos: LatestYoutubeVideo[],
): Promise<void> {
  assertServerOnly();

  const parsed = parseLatestYoutubeVideosCache(videos);

  if (!parsed) {
    throw new Error(
      "YouTube latest-videos cache write requires 1–3 valid videos.",
    );
  }

  const now = new Date().toISOString();
  const supabase = createAdminClient();
  const { error } = await supabase.from(CACHE_TABLE).upsert(
    {
      id: CACHE_ID,
      videos: parsed,
      fetched_at: now,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(
      `[YouTube cache] Write failed${error.code ? ` (${error.code})` : ""}: ${error.message}`,
    );
  }
}
