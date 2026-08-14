"use client";

import { useFormStatus } from "react-dom";

import { deleteProduct } from "@/actions/products/delete-product";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  productId: string;
};

function SubmitButton() {
  const { t } = useLanguage();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="whitespace-nowrap rounded-lg bg-red-500/20 px-2.5 py-2 text-sm text-red-400 transition hover:bg-red-500/30 disabled:opacity-50 sm:px-3"
    >
      {pending ? t.deleting : t.delete}
    </button>
  );
}

export default function DeleteProductButton({ productId }: Props) {
  const { t } = useLanguage();

  return (
    <form
      action={deleteProduct}
      className="inline-flex shrink-0"
      onSubmit={(event) => {
        if (!window.confirm(t.deleteProductConfirm)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={productId} />

      <SubmitButton />
    </form>
  );
}
