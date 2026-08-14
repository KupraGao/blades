import { getBrands } from "@/actions/brands/get-brands";
import AdminBrandsListContent from "@/components/admin/brands/AdminBrandsListContent";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export default async function BrandsPage() {
  const brands: Brand[] = await getBrands();

  return <AdminBrandsListContent brands={brands} />;
}
