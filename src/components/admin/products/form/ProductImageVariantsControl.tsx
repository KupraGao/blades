"use client";

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/context/LanguageContext";
import {
  uploadSavedProductImageVariants,
  type SavedProductImageSource,
  type SavedVariantProgress,
  type SavedVariantUploadIssue,
} from "@/lib/products/upload-saved-product-image-variants";

type ProductImageVariantsControlProps = {
  productId: string;
  images: readonly SavedProductImageSource[];
  disabled?: boolean;
};

export default function ProductImageVariantsControl({
  productId,
  images,
  disabled = false,
}: ProductImageVariantsControlProps) {
  const { t } = useLanguage();
  const runningRef = useRef(false);
  const activeRef = useRef(true);
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<SavedVariantProgress[]>([]);
  const errorCount = rows.filter((row) => row.state === "error").length;

  useEffect(() => {
    activeRef.current = true;

    return () => {
      activeRef.current = false;
    };
  }, []);

  async function handleClick() {
    if (runningRef.current || disabled) {
      return;
    }

    runningRef.current = true;
    setRunning(true);
    setRows([]);

    try {
      await uploadSavedProductImageVariants(productId, images, (update) => {
        if (!activeRef.current) {
          return;
        }

        setRows((current) => applyProgress(current, update));
      });
    } finally {
      runningRef.current = false;

      if (activeRef.current) {
        setRunning(false);
      }
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-300">{t.imageVariantsHint}</p>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || running}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? t.generatingImageVariants : t.generateImageVariants}
        </button>
      </div>

      {rows.length > 0 && (
        <ul aria-live="polite" className="mt-4 space-y-1 text-xs">
          {rows.map((row) => (
            <li key={row.id} className={progressClassName(row)}>
              {progressText(row, t)}
            </li>
          ))}
        </ul>
      )}

      {!running && rows.length > 0 && (
        <p className={`mt-3 text-sm ${errorCount > 0 ? "text-red-300" : "text-zinc-400"}`}>
          {errorCount > 0
            ? t.imageVariantsFinishedWithErrors
            : t.imageVariantsFinished}
        </p>
      )}
    </div>
  );
}

function applyProgress(
  current: SavedVariantProgress[],
  update: SavedVariantProgress,
): SavedVariantProgress[] {
  const visible = update.width == null
    ? current
    : current.filter(
        (row) => !(row.imageId === update.imageId && row.width == null && row.state === "working"),
      );
  const index = visible.findIndex((row) => row.id === update.id);

  if (index === -1) {
    return [...visible, update];
  }

  const next = visible.slice();
  next[index] = update;
  return next;
}

function progressText(
  row: SavedVariantProgress,
  t: ReturnType<typeof useLanguage>["t"],
) {
  const photo = t.imageVariantPhoto.replace("{index}", String(row.imageIndex + 1));

  if (row.width == null) {
    if (row.state === "working") {
      return `${photo}: ${t.generatingImageVariants}`;
    }

    if (row.state === "skipped") {
      return `${photo}: ${t.imageVariantNoWidths}`;
    }

    return `${photo}: ${issueText(row.issue, t)}`;
  }

  const label = `${photo} · ${row.width}px`;

  switch (row.state) {
    case "working":
      return `${label}: ${t.uploading}`;
    case "created":
      return `${label}: ${t.imageVariantCreated}`;
    case "already-stored":
      return `${label}: ${t.imageVariantAlreadyStored}`;
    case "skipped":
      return `${label}: ${t.imageVariantNoWidths}`;
    case "error":
      return `${label}: ${issueText(row.issue, t)}`;
  }
}

function issueText(
  issue: SavedVariantUploadIssue | undefined,
  t: ReturnType<typeof useLanguage>["t"],
) {
  switch (issue) {
    case "FETCH_FAILED":
      return t.imageVariantFetchFailed;
    case "UNREADABLE":
      return t.imageVariantUnreadable;
    case "ENCODE_FAILED":
      return t.imageVariantEncodeFailed;
    case "INVALID_MASTER":
      return t.imageVariantInvalidMaster;
    case "INVALID_VARIANT":
      return t.imageVariantInvalidVariant;
    case "INVALID_INPUT":
      return t.imageVariantInvalidInput;
    case "IMAGE_NOT_FOUND":
      return t.imageVariantImageNotFound;
    case "UPLOAD_FAILED":
      return t.imageVariantUploadFailed;
    case "METADATA_FAILED":
      return t.imageVariantMetadataFailed;
    case "WRITES_BLOCKED":
      return t.imageVariantWritesBlocked;
    case "STORED_UNCONFIRMED":
      return t.imageVariantStoredUnconfirmed;
    case "EXISTING_UNCONFIRMED":
      return t.imageVariantExistingUnconfirmed;
    case "UNAUTHORIZED":
      return t.imageVariantUnauthorized;
    default:
      return t.imageVariantUnknown;
  }
}

function progressClassName(row: SavedVariantProgress) {
  if (row.state === "error") {
    return "text-red-300";
  }

  if (row.state === "created" || row.state === "already-stored") {
    return "text-zinc-200";
  }

  return "text-zinc-400";
}
