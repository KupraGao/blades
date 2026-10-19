import {
  confirmedVariantWidthsFromMetadata,
  productImageDelivery,
} from "@/lib/products/product-image-delivery";

type ProductResponsiveImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  confirmedWidths?: unknown;
  zoom?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
};

export function ProductResponsiveImage({
  src,
  alt,
  sizes,
  confirmedWidths,
  zoom = false,
  fill = false,
  width,
  height,
  className,
}: ProductResponsiveImageProps) {
  const delivery = productImageDelivery(
    src,
    confirmedVariantWidthsFromMetadata(confirmedWidths),
    { zoom },
  );
  const classes = [fill ? "absolute inset-0 h-full w-full" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    // Product photos must bypass /_next/image. Variants are included only when confirmed.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={delivery.src}
      srcSet={delivery.srcSet}
      sizes={delivery.srcSet ? sizes : undefined}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading="lazy"
      decoding="async"
      className={classes}
    />
  );
}
