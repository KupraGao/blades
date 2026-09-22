"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  ADMIN_CUSTOMERS_PAGE_SIZE,
  type AdminCustomerListItem,
  type GetAdminCustomersResult,
} from "@/lib/admin/admin-customers";
import { createAdminClient } from "@/lib/supabase/admin";

// =================================================
// ADMIN CUSTOMER USERS LIST (read-only)
// =================================================
// Auth identity: auth.admin.listUsers (service role)
// Profile fields: public.profiles
// Never returns secrets / tokens / password hashes.
// =================================================

const PAGE_SIZE = ADMIN_CUSTOMERS_PAGE_SIZE;
const SEARCH_SCAN_PER_PAGE = 100;
const SEARCH_SCAN_MAX_PAGES = 25;

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

function normalizePage(value: number | undefined): number {
  if (!Number.isFinite(value) || (value ?? 0) < 1) return 1;
  return Math.floor(value as number);
}

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function mapCustomer(
  user: {
    id: string;
    email?: string;
    created_at: string;
    email_confirmed_at?: string | null;
  },
  profile: ProfileRow | undefined,
): AdminCustomerListItem {
  const fullName =
    typeof profile?.full_name === "string" && profile.full_name.trim()
      ? profile.full_name.trim()
      : null;
  const phone =
    typeof profile?.phone === "string" && profile.phone.trim()
      ? profile.phone.trim()
      : null;

  return {
    id: user.id,
    fullName,
    email: user.email ?? null,
    phone,
    joinedAt: user.created_at,
    emailConfirmed: Boolean(user.email_confirmed_at),
  };
}

async function fetchProfilesByIds(
  supabase: ReturnType<typeof createAdminClient>,
  ids: string[],
): Promise<Map<string, ProfileRow>> {
  const map = new Map<string, ProfileRow>();

  if (ids.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", ids);

  if (error) {
    console.error("Admin customers profiles lookup failed", {
      code: error.code ?? null,
      message: error.message ?? null,
    });
    return map;
  }

  for (const row of data ?? []) {
    map.set(String(row.id), {
      id: String(row.id),
      full_name:
        typeof row.full_name === "string" ? row.full_name : null,
      phone: typeof row.phone === "string" ? row.phone : null,
    });
  }

  return map;
}

async function listAuthUsersPage(
  supabase: ReturnType<typeof createAdminClient>,
  page: number,
  perPage: number,
) {
  return supabase.auth.admin.listUsers({
    page,
    perPage,
  });
}

/**
 * Server-only search scan: Auth Admin has no name/phone filter.
 * Scan capped Auth pages + profiles, then filter.
 */
async function searchCustomers(
  supabase: ReturnType<typeof createAdminClient>,
  rawSearch: string,
  page: number,
): Promise<GetAdminCustomersResult> {
  const query = rawSearch.trim().toLowerCase();
  const safeTerm = rawSearch.trim().replace(/[,()]/g, " ");
  const pattern = `%${escapeIlike(safeTerm)}%`;

  const collectedUsers: Array<{
    id: string;
    email?: string;
    created_at: string;
    email_confirmed_at?: string | null;
  }> = [];
  const seen = new Set<string>();

  let authPage = 1;

  while (authPage <= SEARCH_SCAN_MAX_PAGES) {
    const { data, error } = await listAuthUsersPage(
      supabase,
      authPage,
      SEARCH_SCAN_PER_PAGE,
    );

    if (error) {
      console.error("Admin customers auth search scan failed", {
        code: error.code ?? null,
        status: error.status ?? null,
      });
      return {
        customers: [],
        total: 0,
        totalPages: 0,
        page: 1,
        failed: true,
      };
    }

    const users = data.users ?? [];

    for (const user of users) {
      if (!seen.has(user.id)) {
        seen.add(user.id);
        collectedUsers.push({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
        });
      }
    }

    if (!data.nextPage || users.length < SEARCH_SCAN_PER_PAGE) {
      break;
    }

    authPage = data.nextPage;
  }

  const profileMap = await fetchProfilesByIds(
    supabase,
    collectedUsers.map((user) => user.id),
  );

  // Also include profile-only matches that might have been missed if
  // Auth scan was truncated — query profiles by name/phone.
  const { data: profileHits, error: profileSearchError } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .or(`full_name.ilike.${pattern},phone.ilike.${pattern}`)
    .limit(500);

  if (profileSearchError) {
    console.error("Admin customers profile search failed", {
      code: profileSearchError.code ?? null,
      message: profileSearchError.message ?? null,
    });
  }

  for (const row of profileHits ?? []) {
    const id = String(row.id);
    profileMap.set(id, {
      id,
      full_name:
        typeof row.full_name === "string" ? row.full_name : null,
      phone: typeof row.phone === "string" ? row.phone : null,
    });

    if (!seen.has(id)) {
      const { data: userResult, error: userError } =
        await supabase.auth.admin.getUserById(id);

      if (userError || !userResult.user) {
        continue;
      }

      seen.add(id);
      collectedUsers.push({
        id: userResult.user.id,
        email: userResult.user.email,
        created_at: userResult.user.created_at,
        email_confirmed_at: userResult.user.email_confirmed_at,
      });
    }
  }

  const matched = collectedUsers
    .map((user) => {
      const profile = profileMap.get(user.id);
      const email = (user.email ?? "").toLowerCase();
      const fullName = (profile?.full_name ?? "").toLowerCase();
      const phone = (profile?.phone ?? "").toLowerCase();

      const hits =
        email.includes(query) ||
        fullName.includes(query) ||
        phone.includes(query);

      if (!hits) return null;

      return mapCustomer(user, profile);
    })
    .filter((row): row is AdminCustomerListItem => row !== null)
    .sort((a, b) => {
      const aTime = Date.parse(a.joinedAt) || 0;
      const bTime = Date.parse(b.joinedAt) || 0;
      return bTime - aTime;
    });

  const total = matched.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);
  const safePage =
    totalPages > 0 ? Math.min(page, totalPages) : 1;
  const start = (safePage - 1) * PAGE_SIZE;

  return {
    customers: matched.slice(start, start + PAGE_SIZE),
    total,
    totalPages,
    page: safePage,
    failed: false,
  };
}

export async function getAdminCustomers(options?: {
  search?: string;
  page?: number;
}): Promise<GetAdminCustomersResult> {
  await requireAdmin();

  const page = normalizePage(options?.page);
  const search = options?.search?.trim() ?? "";

  try {
    const supabase = createAdminClient();

    if (search) {
      return searchCustomers(supabase, search, page);
    }

    const { data, error } = await listAuthUsersPage(
      supabase,
      page,
      PAGE_SIZE,
    );

    if (error) {
      console.error("Admin customers listUsers failed", {
        code: error.code ?? null,
        status: error.status ?? null,
      });
      return {
        customers: [],
        total: 0,
        totalPages: 0,
        page: 1,
        failed: true,
      };
    }

    const users = data.users ?? [];
    const total =
      typeof data.total === "number" && Number.isFinite(data.total)
        ? data.total
        : users.length;
    const totalPages =
      typeof data.lastPage === "number" && data.lastPage > 0
        ? data.lastPage
        : total === 0
          ? 0
          : Math.ceil(total / PAGE_SIZE);

    let safePage = page;
    if (totalPages > 0 && page > totalPages) {
      safePage = totalPages;
      const clamped = await listAuthUsersPage(
        supabase,
        safePage,
        PAGE_SIZE,
      );
      if (clamped.error) {
        return {
          customers: [],
          total: 0,
          totalPages: 0,
          page: 1,
          failed: true,
        };
      }
      const clampedUsers = clamped.data.users ?? [];
      const profileMap = await fetchProfilesByIds(
        supabase,
        clampedUsers.map((user) => user.id),
      );
      return {
        customers: clampedUsers.map((user) =>
          mapCustomer(user, profileMap.get(user.id)),
        ),
        total,
        totalPages,
        page: safePage,
        failed: false,
      };
    }

    const profileMap = await fetchProfilesByIds(
      supabase,
      users.map((user) => user.id),
    );

    return {
      customers: users.map((user) =>
        mapCustomer(user, profileMap.get(user.id)),
      ),
      total,
      totalPages,
      page: safePage,
      failed: false,
    };
  } catch (error) {
    console.error("Admin customers unexpected failure", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return {
      customers: [],
      total: 0,
      totalPages: 0,
      page: 1,
      failed: true,
    };
  }
}
