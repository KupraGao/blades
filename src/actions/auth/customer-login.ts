"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// =================================================
// CUSTOMER LOGIN (Auth only — not Admin)
// =================================================
// Does NOT call getAuthorizedAdmin / requireAdmin.
// A normal Auth user must remain signed in.
// =================================================

export type CustomerLoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      errorKey:
        | "accountAuthInvalidEmail"
        | "accountAuthPasswordRequired"
        | "accountAuthEmailNotConfirmed"
        | "accountAuthInvalidCredentials"
        | "accountAuthLoginFailed";
    };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginCustomer(
  email: string,
  password: string,
): Promise<CustomerLoginResult> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password;

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return {
      success: false,
      errorKey: "accountAuthInvalidEmail",
    };
  }

  if (!trimmedPassword) {
    return {
      success: false,
      errorKey: "accountAuthPasswordRequired",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  if (error) {
    console.error("Customer login failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });

    const message = (error.message ?? "").toLowerCase();

    if (
      error.code === "email_not_confirmed" ||
      message.includes("email not confirmed")
    ) {
      return {
        success: false,
        errorKey: "accountAuthEmailNotConfirmed",
      };
    }

    return {
      success: false,
      errorKey: "accountAuthInvalidCredentials",
    };
  }

  redirect("/account");
}
