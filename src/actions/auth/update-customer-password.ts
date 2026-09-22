"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";

// =================================================
// UPDATE CUSTOMER PASSWORD (recovery / authenticated)
// =================================================
// Requires an existing Auth session (established via
// recovery callback or an already signed-in user).
// Uses anon SSR client only — never service_role.
// =================================================

export type UpdateCustomerPasswordResult =
  | {
      success: true;
    }
  | {
      success: false;
      errorKey:
        | "accountResetPasswordUnauthorized"
        | "accountAuthPasswordRequired"
        | "accountAuthPasswordTooShort"
        | "accountAuthPasswordMismatch"
        | "accountResetPasswordFailed";
    };

const MIN_PASSWORD_LENGTH = 8;

export async function updateCustomerPassword(input: {
  password: string;
  confirmPassword: string;
}): Promise<UpdateCustomerPasswordResult> {
  const user = await getAuthUser();

  if (!user) {
    return {
      success: false,
      errorKey: "accountResetPasswordUnauthorized",
    };
  }

  // Do not trim passwords — whitespace may be intentional.
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!password) {
    return {
      success: false,
      errorKey: "accountAuthPasswordRequired",
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      errorKey: "accountAuthPasswordTooShort",
    };
  }

  if (!confirmPassword) {
    return {
      success: false,
      errorKey: "accountAuthPasswordRequired",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      errorKey: "accountAuthPasswordMismatch",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Customer password update failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });

    return {
      success: false,
      errorKey: "accountResetPasswordFailed",
    };
  }

  return {
    success: true,
  };
}
