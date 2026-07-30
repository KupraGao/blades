"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSingleCategory(id: string){

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
    console.log("CATEGORY ID:", id);
console.log("DATA:", data);
console.log("ERROR:", error);

  if (error) {
    console.log("GET SINGLE CATEGORY ERROR:", error);
    return null;
  }

  return data;

}