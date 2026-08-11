import { getSingleBrand } from "@/actions/brands/get-single-brand";
import { updateBrand } from "@/actions/brands/update-brand";
import BrandForm from "@/components/admin/brands/BrandForm";
import BrandNotFound from "@/components/admin/brands/BrandNotFound";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params;

  const brand = await getSingleBrand(Number(id));

  if (!brand) {
    return <BrandNotFound />;
  }

  async function update(formData: FormData) {
    "use server";
    await updateBrand(Number(id), formData);
  }

  return <BrandForm mode="edit" brand={brand} action={update} />;
}
