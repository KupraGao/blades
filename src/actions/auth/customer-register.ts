"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// =================================================
// CUSTOMER REGISTER (Auth only — not Admin)
// =================================================
// Uses the public anon server client + Auth cookies.
// Never uses createAdminClient / requireAdmin.
// =================================================

export type CustomerRegisterResult =
  | {
      success: true;
      requiresEmailConfirmation: boolean;
    }
  | {
      success: false;
      errorKey:
        | "accountAuthFullNameRequired"
        | "accountAuthFullNameMin"
        | "accountAuthPhoneRequired"
        | "accountAuthPhoneInvalid"
        | "accountAuthInvalidEmail"
        | "accountAuthPasswordRequired"
        | "accountAuthPasswordTooShort"
        | "accountAuthPasswordMismatch"
        | "accountAuthEmailTaken"
        | "accountAuthRegisterFailed";
    };

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MIN_PHONE_LENGTH = 9;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function resolveEmailRedirectTo() {
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    null;

  if (!origin) {
    return undefined;
  }

  return `${origin.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent("/account")}`;
}

export async function registerCustomer(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<CustomerRegisterResult> {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const trimmedEmail = input.email.trim().toLowerCase();
  const trimmedPassword = input.password;
  const trimmedConfirm = input.confirmPassword;

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

  if (!phone) {
    return {
      success: false,
      errorKey: "accountAuthPhoneRequired",
    };
  }

  if (phone.length < MIN_PHONE_LENGTH) {
    return {
      success: false,
      errorKey: "accountAuthPhoneInvalid",
    };
  }

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

  if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      errorKey: "accountAuthPasswordTooShort",
    };
  }

  if (trimmedPassword !== trimmedConfirm) {
    return {
      success: false,
      errorKey: "accountAuthPasswordMismatch",
    };
  }

  const supabase = await createClient();
  const emailRedirectTo = await resolveEmailRedirectTo();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: trimmedPassword,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
      ...(emailRedirectTo
        ? {
            emailRedirectTo,
          }
        : {}),
    },
  });

  if (error) {
    console.error("Customer register failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });

    const message = (error.message ?? "").toLowerCase();

    if (
      error.code === "user_already_exists" ||
      message.includes("already registered") ||
      message.includes("already been registered")
    ) {
      return {
        success: false,
        errorKey: "accountAuthEmailTaken",
      };
    }

    return {
      success: false,
      errorKey: "accountAuthRegisterFailed",
    };
  }

  // Confirmation enabled → user may exist with no session yet.
  if (!data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
    };
  }

  redirect("/account");
}
