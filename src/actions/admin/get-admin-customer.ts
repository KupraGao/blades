"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import type {
  AdminCustomerDetailResult,
  AdminCustomerOrderSummary,
} from "@/lib/admin/admin-customers";
import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// GET ADMIN CUSTOMER DETAIL (read-only)
// =================================================
// Auth user + profiles + owned orders (orders.user_id).
// Never matches guest orders by email.
// =================================================

const FULL_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const OWNED_ORDERS_LIMIT = 100;

function isUuid(value: string): boolean {
  return FULL_UUID_RE.test(value);
}

export async function getAdminCustomer(
  id: string,
): Promise<AdminCustomerDetailResult | null> {
  await requireAdmin();

  const trimmedId = id.trim();

  if (!trimmedId || !isUuid(trimmedId)) {
    return null;
  }

  try {
    const supabase = createAdminClient();

    const { data: userResult, error: userError } =
      await supabase.auth.admin.getUserById(trimmedId);

    if (userError || !userResult.user) {
      if (userError) {
        console.error("Admin customer getUserById failed", {
          code: userError.code ?? null,
          status: userError.status ?? null,
        });
      }
      return null;
    }

    const user = userResult.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", trimmedId)
      .maybeSingle();

    if (profileError) {
      console.error("Admin customer profile lookup failed", {
        code: profileError.code ?? null,
        message: profileError.message ?? null,
      });
    }

    const fullName =
      typeof profile?.full_name === "string" && profile.full_name.trim()
        ? profile.full_name.trim()
        : null;
    const phone =
      typeof profile?.phone === "string" && profile.phone.trim()
        ? profile.phone.trim()
        : null;

    const { data: orderRows, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, status, fulfillment_method, total_price",
      )
      .eq("user_id", trimmedId)
      .order("created_at", { ascending: false })
      .limit(OWNED_ORDERS_LIMIT);

    if (ordersError) {
      console.error("Admin customer orders lookup failed", {
        code: ordersError.code ?? null,
        message: ordersError.message ?? null,
      });
    }

    const orders: AdminCustomerOrderSummary[] = (orderRows ?? []).map(
      (row) => ({
        id: String(row.id),
        orderNumber: row.order_number ?? null,
        createdAt: String(row.created_at ?? ""),
        status: row.status ?? null,
        fulfillmentMethod: row.fulfillment_method ?? null,
        totalPrice: row.total_price ?? 0,
      }),
    );

    return {
      customer: {
        id: user.id,
        fullName,
        email: user.email ?? null,
        phone,
        joinedAt: user.created_at,
        emailConfirmed: Boolean(user.email_confirmed_at),
      },
      orders,
    };
  } catch (error) {
    console.error("Admin customer detail unexpected failure", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return null;
  }
}
