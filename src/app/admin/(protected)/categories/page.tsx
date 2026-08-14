import { getCategories } from "@/actions/categories/get-categories";
import AdminCategoriesListContent from "@/components/admin/categories/AdminCategoriesListContent";

type Category = {
  id: string;
  name_ka: string;
  name_en: string;
};

export default async function CategoriesPage() {
  const categories: Category[] = await getCategories();

  return <AdminCategoriesListContent categories={categories} />;
}
