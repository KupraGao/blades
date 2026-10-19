"use server";

import { unstable_rethrow } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createProductImageVariantMetadataWriter } from "@/lib/products/product-image-variant-metadata";
import {
  createOwnedProductImageLookup,
  createProductImageVariantStore,
  ProductImageVariantUploadError,
  readProductImageVariantUpload,
  uploadProductImageVariantRecord,
  type ProductImageVariantUploadCode,
  type ProductImageVariantUploadSuccess,
} from "@/lib/products/product-image-variant-storage";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProductImageVariantActionFailureCode =
  | ProductImageVariantUploadCode
  | "UNAUTHORIZED";

export type ProductImageVariantActionResult =
  | { ok: true; value: ProductImageVariantUploadSuccess }
  | { ok: false; code: ProductImageVariantActionFailureCode };

// კოდი ბრუნდება მონაცემად, რათა production-ში შეცდომის ტექსტის დამალვამ ადმინისტრატორს გასაგები შეტყობინება არ წაართვას.
export async function uploadProductImageVariant(
  formData: FormData,
): Promise<ProductImageVariantActionResult> {
  try {
    await requireAdmin();

    const supabase = createAdminClient();
    const input = await readProductImageVariantUpload(formData);
    const value = await uploadProductImageVariantRecord(
      createOwnedProductImageLookup(supabase),
      createProductImageVariantStore(supabase),
      createProductImageVariantMetadataWriter(supabase),
      input,
    );

    return { ok: true, value };
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ProductImageVariantUploadError) {
      return { ok: false, code: error.code };
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return { ok: false, code: "UNAUTHORIZED" };
    }

    return { ok: false, code: "UPLOAD_FAILED" };
  }
}
