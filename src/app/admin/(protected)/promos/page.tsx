import { getAdminPromoBanners } from "@/actions/promos/get-admin-promo-banners";
import AdminPromosListContent from "@/components/admin/promos/AdminPromosListContent";

export default async function AdminPromosPage() {
  const banners = await getAdminPromoBanners();

  return <AdminPromosListContent banners={banners} />;
}
