import type { SupabaseClient } from "@supabase/supabase-js";

type ImageOrderRow = {
  id: string;
  is_main: boolean;
  sort_order: number;
};

async function loadProductImageOrderRows(
  supabase: SupabaseClient,
  productId: string,
): Promise<ImageOrderRow[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("id, is_main, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ImageOrderRow[];
}

async function writeProductImageSortOrders(
  supabase: SupabaseClient,
  assignments: { id: string; sort_order: number }[],
) {
  if (assignments.length === 0) {
    return;
  }

  const offset = 10_000;

  for (const row of assignments) {
    const { error } = await supabase
      .from("product_images")
      .update({ sort_order: row.sort_order + offset })
      .eq("id", row.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const row of assignments) {
    const { error } = await supabase
      .from("product_images")
      .update({ sort_order: row.sort_order })
      .eq("id", row.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function resequenceProductImages(
  supabase: SupabaseClient,
  productId: string,
): Promise<void> {
  const rows = await loadProductImageOrderRows(supabase, productId);
  const main = rows.find((row) => row.is_main);
  const rest = rows
    .filter((row) => !row.is_main)
    .sort((left, right) => left.sort_order - right.sort_order);
  const ordered = main ? [main, ...rest] : rest;

  await writeProductImageSortOrders(
    supabase,
    ordered.map((row, index) => ({ id: row.id, sort_order: index })),
  );
}

export async function applyMainImageSortOrder(
  supabase: SupabaseClient,
  productId: string,
  newMainImageId: string,
): Promise<void> {
  const rows = await loadProductImageOrderRows(supabase, productId);
  const exists = rows.some((row) => row.id === newMainImageId);

  if (!exists) {
    throw new Error("Image not found.");
  }

  const rest = rows
    .filter((row) => row.id !== newMainImageId)
    .sort((left, right) => left.sort_order - right.sort_order);

  await writeProductImageSortOrders(supabase, [
    { id: newMainImageId, sort_order: 0 },
    ...rest.map((row, index) => ({ id: row.id, sort_order: index + 1 })),
  ]);
}

export async function getNextGallerySortOrder(
  supabase: SupabaseClient,
  productId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || typeof data.sort_order !== "number") {
    return 0;
  }

  return data.sort_order + 1;
}

export async function moveGalleryImageOrder(
  supabase: SupabaseClient,
  productId: string,
  imageId: string,
  direction: "up" | "down",
): Promise<void> {
  const rows = await loadProductImageOrderRows(supabase, productId);
  const index = rows.findIndex((row) => row.id === imageId);

  if (index < 0) {
    throw new Error("Image not found.");
  }

  const current = rows[index];

  if (current.is_main || current.sort_order === 0) {
    return;
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 1 || swapIndex >= rows.length) {
    return;
  }

  const swapWith = rows[swapIndex];

  if (swapWith.is_main || swapWith.sort_order === 0) {
    return;
  }

  await writeProductImageSortOrders(supabase, [
    { id: current.id, sort_order: swapWith.sort_order },
    { id: swapWith.id, sort_order: current.sort_order },
  ]);
}
