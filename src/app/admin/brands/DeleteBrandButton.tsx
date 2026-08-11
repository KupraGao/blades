"use client";

import { useFormStatus } from "react-dom";
import { deleteBrand } from "@/actions/brands/delete-brand";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  brandId: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 disabled:opacity-50"
    >
      {pending ? t.deleting : t.delete}
    </button>
  );
}

export default function DeleteBrandButton({ brandId }: Props) {
  const { t } = useLanguage();

  return (
    <form
      action={deleteBrand}
      onSubmit={(e) => {
        if (!window.confirm(t.deleteBrandConfirm)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={brandId} />

      <SubmitButton />
    </form>
  );
}
