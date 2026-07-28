"use client";

import { useFormStatus } from "react-dom";
import { deleteBrand } from "@/actions/brands/delete-brand";

type Props = {
  brandId: number;
};

function SubmitButton() {

  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );

}

export default function DeleteBrandButton({
  brandId,
}: Props) {

  return (

    <form
      action={deleteBrand}
      onSubmit={(e) => {

        if (!window.confirm("Delete this brand?")) {
          e.preventDefault();
        }

      }}
    >

      <input
        type="hidden"
        name="id"
        value={brandId}
      />

      <SubmitButton />

    </form>

  );

}