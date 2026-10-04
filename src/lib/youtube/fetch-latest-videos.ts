import {
  readLatestYoutubeVideosCache,
  writeLatestYoutubeVideosCache,
} from "@/lib/youtube/latest-videos-cache";

const YOUTUBE_CHANNEL_ID = "UCV4ORvOeTcfirolaMQ5P86w";
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const LATEST_VIDEO_LIMIT = 3;
const FETCH_TIMEOUT_MS = 8000;

export type LatestYoutubeVideo = {
  videoId: string;
  title: string;
  published: string;
  url: string;
  thumbnail: string;
};

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("fetchLatestYoutubeVideos can only be used on the server.");
  }
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function firstMatch(source: string, pattern: RegExp): string {
  return source.match(pattern)?.[1]?.trim() ?? "";
}

function parseEntry(entryXml: string): LatestYoutubeVideo | null {
  const videoId = firstMatch(entryXml, /<yt:videoId>([^<]+)<\/yt:videoId>/i);

  if (!YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  const rawTitle = firstMatch(entryXml, /<title>([^<]*)<\/title>/i);
  const title = decodeXmlEntities(rawTitle).trim();

  if (!title) {
    return null;
  }

  const published = firstMatch(entryXml, /<published>([^<]+)<\/published>/i);

  if (!published) {
    return null;
  }

  return {
    videoId,
    title,
    published,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

function parseLatestVideos(xml: string): LatestYoutubeVideo[] {
  const videos: LatestYoutubeVideo[] = [];
  const entryPattern = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;
  let match: RegExpExecArray | null;

  while (
    videos.length < LATEST_VIDEO_LIMIT &&
    (match = entryPattern.exec(xml)) !== null
  ) {
    const video = parseEntry(match[1] ?? "");

    if (video) {
      videos.push(video);
    }
  }

  return videos;
}

export async function fetchLatestYoutubeVideos(): Promise<LatestYoutubeVideo[]> {
  assertServerOnly();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(YOUTUBE_FEED_URL, {
      signal: controller.signal,
      next: { revalidate: 1800 },
      headers: {
        Accept: "application/atom+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      console.warn("[YouTube RSS] HTTP error", {
        status: response.status,
        statusText: response.statusText,
      });

      return readLatestYoutubeVideosCache();
    }

    const xml = await response.text();

    if (!xml.trim()) {
      console.warn("[YouTube RSS] Empty XML response");
      return readLatestYoutubeVideosCache();
    }

    const videos = parseLatestVideos(xml);

    if (videos.length === 0) {
      console.warn("[YouTube RSS] XML received but no videos were parsed", {
        xmlLength: xml.length,
      });

      return readLatestYoutubeVideosCache();
    }

    try {
      await writeLatestYoutubeVideosCache(videos);
    } catch (error) {
      console.error(
        "[YouTube cache] Write failed after successful RSS fetch",
        error,
      );
    }

    return videos;
  } catch (error) {
    console.warn("[YouTube RSS] Fetch failed", error);
    return readLatestYoutubeVideosCache();
  } finally {
    clearTimeout(timeout);
  }
}
