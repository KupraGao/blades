// ======================================================
// PRODUCT FORM INPUT
// ======================================================

export interface ProductInput {
  title: string;
  description: string;
  price: number;
  stock: number;
  brandId: number | null;
  categories: string[];
  bladeSteel: string;
  bladeThickness: string;
  bladeLength: string;
  handleMaterial: string;
  lockingType: string;
  knifeType: string;
  bladeFinish: string;
  country: string;
  weight: string;
  overallLength: string;
  reviewLink: string;
}

// ======================================================
// PARSED PRODUCT FORM
// ======================================================

export interface ParsedProductForm {
  product: ProductInput;
  mainImage: File | null;
  galleryImages: File[];
}

// ======================================================
// CREATE PRODUCT
// ======================================================

export interface CreateProductInput extends ProductInput {}

// ======================================================
// UPDATE PRODUCT
// ======================================================

export interface UpdateProductInput extends ProductInput {
  id: number;
}