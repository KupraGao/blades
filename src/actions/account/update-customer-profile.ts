"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";

// =================================================
// UPDATE CUSTOMER PROFILE (self-service)
// =================================================
// Authenticated customer only. Updates public.profiles
// where id = auth user.id (never a client-supplied id).
// Uses the anon SSR client so RLS remains the DB gate.
// Does NOT touch user_metadata, orders, or Admin clients.
// =================================================

export type UpdateCustomerProfileErrorKey =
  | "accountAuthFullNameRequired"
  | "accountAuthFullNameMin"
  | "accountProfileUpdateUnauthorized"
  | "accountProfileUpdateFailed";

export type UpdateCustomerProfileResult =
  | {
      success: true;
      fullName: string;
      phone: string;
    }
  | {
      success: false;
      errorKey: UpdateCustomerProfileErrorKey;
    };

const MIN_NAME_LENGTH = 2;

export async function updateCustomerProfile(input: {
  fullName: string;
  phone: string;
}): Promise<UpdateCustomerProfileResult> {
  const user = await getAuthUser();

  if (!user) {
    return {
      success: false,
      errorKey: "accountProfileUpdateUnauthorized",
    };
  }

  const fullName = input.fullName.trim();
  const phone = input.phone.trim();

  if (!fullName) {
    return {
      success: false,
      errorKey: "accountAuthFullNameRequired",
    };
  }

  if (fullName.length < MIN_NAME_LENGTH) {
    return {
      success: false,
      errorKey: "accountAuthFullNameMin",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone.length > 0 ? phone : null,
    })
    .eq("id", user.id)
    .select("full_name, phone")
    .maybeSingle();

  if (error || !data) {
    console.error("Customer profile update failed", {
      code: error?.code ?? null,
      message: error?.message ?? null,
      hasRow: Boolean(data),
    });

    return {
      success: false,
      errorKey: "accountProfileUpdateFailed",
    };
  }

  revalidatePath("/account");

  return {
    success: true,
    fullName:
      typeof data.full_name === "string" ? data.full_name.trim() : "",
    phone: typeof data.phone === "string" ? data.phone.trim() : "",
  };
}
