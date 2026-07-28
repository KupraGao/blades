import { getSingleBrand } from "@/actions/brands/get-single-brand";
import { updateBrand } from "@/actions/brands/update-brand";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBrandPage({ params }: Props) {

  const { id } = await params;

  const brand = await getSingleBrand(Number(id));

  if (!brand) {
    return (
      <h1 className="text-2xl font-bold">
        Brand not found
      </h1>
    );
  }

  async function update(formData: FormData) {
    "use server";
    await updateBrand(Number(id), formData);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">
        Edit Brand
      </h1>

      <form action={update} className="space-y-6">

        <div>
          <label className="mb-2 block font-medium">
            Brand Name
          </label>

          <input
            type="text"
            name="name"
            defaultValue={brand.name}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Slug
          </label>

          <input
            type="text"
            name="slug"
            defaultValue={brand.slug}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Logo URL
          </label>

          <input
            type="text"
            name="logo"
            defaultValue={brand.logo ?? ""}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Update Brand
        </button>

      </form>
    </div>
  );
}