"use client";

import { useFormStatus } from "react-dom";

import { deletePromoBanner } from "@/actions/promos/delete-promo-banner";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  bannerId: string;
  stretch?: boolean;
};

function SubmitButton({ stretch = false }: { stretch?: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        stretch
          ? "inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
          : "whitespace-nowrap rounded-lg bg-red-500/20 px-2.5 py-2 text-sm text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
      }
    >
      {pending ? t.deleting : t.delete}
    </button>
  );
}

export default function DeletePromoBannerButton({
  bannerId,
  stretch = false,
}: Props) {
  const { t } = useLanguage();

  return (
    <form
      action={deletePromoBanner}
      className={stretch ? "min-w-0" : "inline-flex shrink-0"}
      onSubmit={(e) => {
        if (!window.confirm(t.deletePromoBannerConfirm)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={bannerId} />
      <SubmitButton stretch={stretch} />
    </form>
  );
}
