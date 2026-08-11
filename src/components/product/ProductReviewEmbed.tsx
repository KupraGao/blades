"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  src: string;
};

export default function ProductReviewEmbed({ src }: Props) {
  const { t } = useLanguage();

  return (
    <iframe
      width="100%"
      height="450"
      src={src}
      title={t.videoReview}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-video w-full"
    />
  );
}
