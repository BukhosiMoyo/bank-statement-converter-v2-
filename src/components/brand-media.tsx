import Image from "next/image";

import { BRAND_NAME } from "@/lib/brand";

export function BrandIcon({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      alt={BRAND_NAME}
      className={className}
      height={300}
      priority={priority}
      src="/brand/icon.png"
      width={300}
    />
  );
}

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      alt={BRAND_NAME}
      className={className}
      height={274}
      priority={priority}
      src="/brand/logo.png"
      width={1000}
    />
  );
}
