"use server";

import { createClient } from "@/lib/supabase/server";

type GetProductsOptions = {
  categoryId?: string;
  onSale?: boolean;
  brandId?: string;
  stock?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
};

export async function getProducts({
  categoryId,
  onSale = false,
  brandId,
  stock,
  search,
  sort,
  page = 1,
  limit = 20,
  minPrice = null,
  maxPrice = null,
}: GetProductsOptions = {}) {
  const supabase = await createClient();

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : 20;

  const applyCategoryJoin = Boolean(categoryId) && !onSale;

  const categoryEmbed = applyCategoryJoin
    ? "product_categories!inner(category_id,categories(id,name_ka,name_en))"
    : "product_categories(category_id,categories(id,name_ka,name_en))";

  let query = supabase
    .from("products")
    .select(
      `
      *,
      brands(id,name,slug,logo),
      product_images(id,image_url,is_main),
      ${categoryEmbed}
    `,
      {
        count: "exact",
      },
    );

  if (onSale) {
    query = query.not("sale_price", "is", null);
  } else if (categoryId) {
    query = query.eq("product_categories.category_id", categoryId);
  }

  if (brandId) {
    query = query.eq("brand_id", brandId);
  }

  if (stock === "in-stock") {
    query = query.gt("stock", 0);
  }

  if (stock === "out-of-stock") {
    query = query.eq("stock", 0);
  }

  // Catalog selling price = generated products.effective_price
  // (COALESCE(sale_price, price)). Requires
  // docs/sql/add-products-effective-price.sql in Supabase.
  if (minPrice !== null && minPrice !== undefined && Number.isFinite(minPrice)) {
    query = query.gte("effective_price", minPrice);
  }

  if (maxPrice !== null && maxPrice !== undefined && Number.isFinite(maxPrice)) {
    query = query.lte("effective_price", maxPrice);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,knife_type.ilike.%${search}%,blade_steel.ilike.%${search}%,handle_material.ilike.%${search}%,country.ilike.%${search}%`,
    );
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;

    case "price-asc":
      query = query.order("effective_price", { ascending: true });
      break;

    case "price-desc":
      query = query.order("effective_price", { ascending: false });
      break;

    case "name-asc":
      query = query.order("title", { ascending: true });
      break;

    case "name-desc":
      query = query.order("title", { ascending: false });
      break;

    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.log("PRODUCTS FETCH ERROR:", error);

    return {
      products: [],
      total: 0,
      totalPages: 0,
    };
  }

  const total = count ?? 0;

  return {
    products: data,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}
