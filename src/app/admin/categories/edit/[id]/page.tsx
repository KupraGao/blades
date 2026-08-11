import { getSingleCategory } from "@/actions/categories/get-single-category";
import { updateCategory } from "@/actions/categories/update-category";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import CategoryNotFound from "@/components/admin/categories/CategoryNotFound";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  const category = await getSingleCategory(id);

  if (!category) {
    return <CategoryNotFound />;
  }

  async function update(formData: FormData) {
    "use server";
    await updateCategory(id, formData);
  }

  return (
    <CategoryForm mode="edit" category={category} action={update} />
  );
}
