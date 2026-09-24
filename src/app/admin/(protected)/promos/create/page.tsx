import { createPromoBanner } from "@/actions/promos/create-promo-banner";
import PromoBannerForm from "@/components/admin/promos/PromoBannerForm";

export default function CreatePromoBannerPage() {
  return <PromoBannerForm mode="create" action={createPromoBanner} />;
}
