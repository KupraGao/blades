import { getAdminPromoBanner } from "@/actions/promos/get-admin-promo-banners";
import { updatePromoBanner } from "@/actions/promos/update-promo-banner";
import PromoBannerForm from "@/components/admin/promos/PromoBannerForm";
import PromoBannerNotFound from "@/components/admin/promos/PromoBannerNotFound";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPromoBannerPage({ params }: Props) {
  const { id } = await params;
  const banner = await getAdminPromoBanner(id);

  if (!banner) {
    return <PromoBannerNotFound />;
  }

  async function update(formData: FormData) {
    "use server";
    await updatePromoBanner(id, formData);
  }

  return <PromoBannerForm mode="edit" banner={banner} action={update} />;
}
