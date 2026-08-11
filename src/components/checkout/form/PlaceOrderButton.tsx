"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  disabled?: boolean;
  isSubmitting?: boolean;
  onClick?: () => void;
};

export default function PlaceOrderButton({
  disabled = false,
  isSubmitting = false,
  onClick,
}: Props) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="
        w-full
        rounded-xl
        bg-black
        px-5
        py-3
        font-semibold
        text-white
        transition
        hover:opacity-90
        disabled:cursor-not-allowed
        disabled:opacity-50
        dark:bg-white
        dark:text-black
      "
    >
      {isSubmitting ? t.placingOrder : t.placeOrder}
    </button>
  );
}
