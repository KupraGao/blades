import { ProductInput } from "@/types/product.types";

export function productMapper(product: ProductInput) {
  return {
    title: product.title,
    description: product.description,
    price: product.price,
    stock: product.stock,

    brand_id: product.brandId,

    blade_steel: product.bladeSteel,
    blade_thickness: product.bladeThickness,
    blade_length: product.bladeLength,
    handle_material: product.handleMaterial,
    locking_type: product.lockingType,
    knife_type: product.knifeType,
    blade_finish: product.bladeFinish,

    country: product.country,
    weight: product.weight,
    overall_length: product.overallLength,

    review_link: product.reviewLink,
  };
}