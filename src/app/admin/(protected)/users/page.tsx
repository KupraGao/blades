import { Suspense } from "react";

import { getAdminCustomers } from "@/actions/admin/get-admin-customers";
import AdminUsersListContent from "@/components/admin/users/AdminUsersListContent";
import { ADMIN_CUSTOMERS_PAGE_SIZE } from "@/lib/admin/admin-customers";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

function normalizePage(value?: string): number {
  const parsed = Number(value ?? 1);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const page = normalizePage(params.page);

  const result = await getAdminCustomers({
    search,
    page,
  });

  return (
    <Suspense fallback={null}>
      <AdminUsersListContent
        customers={result.customers}
        total={result.total}
        totalPages={result.totalPages}
        page={result.page}
        pageSize={ADMIN_CUSTOMERS_PAGE_SIZE}
        hasSearch={Boolean(search)}
        failed={result.failed}
      />
    </Suspense>
  );
}
