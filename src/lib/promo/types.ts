export type PromoBannerRow = {
  id: string;
  image_path: string;
  title_ka: string | null;
  title_en: string | null;
  subtitle_ka: string | null;
  subtitle_en: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type StorefrontPromoBanner = {
  id: string;
  imageUrl: string;
  title_ka: string | null;
  title_en: string | null;
  subtitle_ka: string | null;
  subtitle_en: string | null;
  link_url: string | null;
};

export type AdminPromoBanner = PromoBannerRow & {
  imageUrl: string;
};
