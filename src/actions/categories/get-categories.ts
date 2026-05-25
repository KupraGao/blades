"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCategories() {

  // =========================================
  // SUPABASE
  // =========================================

  const supabase =
    await createClient();

  // =========================================
  // FETCH CATEGORIES
  // =========================================

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .select("*")
    .order("id");

  // =========================================
  // ERROR
  // =========================================

  if (error) {

    console.log(
      "CATEGORIES ERROR:",
      error
    );

    return [];

  }

  // =========================================
  // SUCCESS
  // =========================================

  return data;

}