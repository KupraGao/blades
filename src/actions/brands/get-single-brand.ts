"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSingleBrand(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log("GET SINGLE BRAND ERROR:", error);
    return null;
  }

  return data;
}