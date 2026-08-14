"use client";

import { useTransition } from "react";

import { logout } from "@/actions/auth/logout";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  className?: string;
  onAfterClick?: () => void;
};

export default function AdminLogoutButton({
  className = "",
  onAfterClick,
}: Props) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    onAfterClick?.();
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={
        className ||
        "w-full rounded-lg border border-zinc-700 px-4 py-3 text-left text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {isPending ? t.adminLogoutSubmitting : t.adminLogout}
    </button>
  );
}
