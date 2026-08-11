import { createCategory } from "@/actions/categories/create-category";
import CategoryForm from "@/components/admin/categories/CategoryForm";

export default function CreateCategoryPage() {
  return <CategoryForm mode="create" action={createCategory} />;
}
