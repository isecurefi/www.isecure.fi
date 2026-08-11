import type { Lang } from "../types";

export const languages: Lang[] = ["fi", "en", "se"];
export const defaultLanguage: Lang = "fi";

export function getLanguageFromUrl(url: URL | null): Lang {
  if (!url || !url.pathname) {
    return defaultLanguage;
  }

  const path = url.pathname;

  // Special cases for Finnish
  if (
    path === "/" ||
    path === "/index.html" ||
    path === "/ws-channel/index.html" ||
    path === "/ws-api/index.html"
  ) {
    return "fi";
  }

  // Check if path starts with a language code
  const match = path.match(/^\/([^/]+)/);
  if (match && languages.includes(match[1] as Lang)) {
    return match[1] as Lang;
  }

  return defaultLanguage;
}

export function getLocalizedPathname(pathname: string, lang: Lang): string {
  const withoutIndex = pathname.replace(/\/index\.html$/u, "/");
  const withoutLanguage = withoutIndex.replace(/^\/(?:fi|en|se)(?=\/|$)/u, "");
  const contentPath = withoutLanguage === "" ? "/" : withoutLanguage;
  const localized = lang === "fi" ? contentPath : `/${lang}${contentPath}`;
  return localized.endsWith("/") ? localized : `${localized}/`;
}
