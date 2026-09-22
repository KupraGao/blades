"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";

// =================================================
// CHANGE CUSTOMER PASSWORD (logged-in)
// =================================================
// Proves current password via signInWithPassword, then
// updates password with auth.updateUser.
// Anon SSR client only — never service_role / admin APIs.
// =================================================

export type ChangeCustomerPasswordErrorKey =
  | "accountChangePasswordUnauthorized"
  | "accountAuthPasswordRequired"
  | "accountAuthPasswordTooShort"
  | "accountAuthPasswordMismatch"
  | "accountChangePasswordSameAsCurrent"
  | "accountChangePasswordCurrentIncorrect"
  | "accountChangePasswordFailed";

export type ChangeCustomerPasswordResult =
  | {
      success: true;
    }
  | {
      success: false;
      errorKey: ChangeCustomerPasswordErrorKey;
    };

const MIN_PASSWORD_LENGTH = 8;

export async function changeCustomerPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ChangeCustomerPasswordResult> {
  const user = await getAuthUser();
  const email = user?.email?.trim() ?? "";

  if (!user || !email) {
    return {
      success: false,
      errorKey: "accountChangePasswordUnauthorized",
    };
  }

  // Do not trim passwords — whitespace may be intentional.
  const currentPassword = input.currentPassword;
  const newPassword = input.newPassword;
  const confirmPassword = input.confirmPassword;

  if (!currentPassword) {
    return {
      success: false,
      errorKey: "accountAuthPasswordRequired",
    };
  }

  if (!newPassword) {
    return {
      success: false,
      errorKey: "accountAuthPasswordRequired",
    };
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
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

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      errorKey: "accountAuthPasswordMismatch",
    };
  }

  if (newPassword === currentPassword) {
    return {
      success: false,
      errorKey: "accountChangePasswordSameAsCurrent",
    };
  }

  const supabase = await createClient();

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (reauthError) {
    console.error("Customer change-password reauth failed", {
      code: reauthError.code ?? null,
      status: reauthError.status ?? null,
    });

    return {
      success: false,
      errorKey: "accountChangePasswordCurrentIncorrect",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Customer change-password update failed", {
      code: error.code ?? null,
      status: error.status ?? null,
    });

    return {
      success: false,
      errorKey: "accountChangePasswordFailed",
    };
  }

  return {
    success: true,
  };
}
