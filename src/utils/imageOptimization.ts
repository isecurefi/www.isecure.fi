import type { ImageMetadata } from "astro";

export interface OptimizedImageProps {
  src: string | ImageMetadata;
  alt: string;
  width?: number;
  height?: number;
  class?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  sizes?: string;
  fetchpriority?: "high" | "low" | "auto";
  quality?: number;
}

export const defaultImageSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function getResponsiveSizes(baseSize: number): string {
  return `(max-width: ${defaultImageSizes.sm}px) 100vw,
          (max-width: ${defaultImageSizes.md}px) ${defaultImageSizes.sm}px,
          (max-width: ${defaultImageSizes.lg}px) ${defaultImageSizes.md}px,
          ${baseSize}px`;
}
