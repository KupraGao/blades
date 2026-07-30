import { ProductInput } from "@/types/product.types";

export function parseProductForm(
  formData: FormData
): ProductInput {

  return {

    title: String(formData.get("title") ?? "").trim(),

    description: String(formData.get("description") ?? "").trim(),

    price: Number(formData.get("price") ?? 0),

    stock: Number(formData.get("stock") ?? 0),

    brandId: formData.get("brandId")
      ? Number(formData.get("brandId"))
      : null,

    categories: formData
      .getAll("categories")
      .map(category => String(category)),

    bladeSteel: String(formData.get("bladeSteel") ?? "").trim(),

    bladeThickness: String(formData.get("bladeThickness") ?? "").trim(),

    bladeLength: String(formData.get("bladeLength") ?? "").trim(),

    handleMaterial: String(formData.get("handleMaterial") ?? "").trim(),

    lockingType: String(formData.get("lockingType") ?? "").trim(),

    knifeType: String(formData.get("knifeType") ?? "").trim(),

    bladeFinish: String(formData.get("bladeFinish") ?? "").trim(),

    country: String(formData.get("country") ?? "").trim(),

    weight: String(formData.get("weight") ?? "").trim(),

    overallLength: String(formData.get("overallLength") ?? "").trim(),

    reviewLink: String(formData.get("reviewLink") ?? "").trim(),

  };

}