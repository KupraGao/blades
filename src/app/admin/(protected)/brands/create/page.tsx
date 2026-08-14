import { createBrand } from "@/actions/brands/create-brand";
import BrandForm from "@/components/admin/brands/BrandForm";

export default function CreateBrandPage() {
  return <BrandForm mode="create" action={createBrand} />;
}
