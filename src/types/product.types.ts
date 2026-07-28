// ======================================================
// PRODUCT FORM INPUT
// ======================================================

export interface ProductInput {
  title: string;
  description: string;
  price: number;
  stock: number;

  brandId: number | null;

  categories: number[];

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
// CREATE PRODUCT
// ======================================================

export interface CreateProductInput extends ProductInput {}

// ======================================================
// UPDATE PRODUCT
// ======================================================

export interface UpdateProductInput extends ProductInput {
  id: number;
}