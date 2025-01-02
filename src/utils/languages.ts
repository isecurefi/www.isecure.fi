import type { Lang } from "../types";

export const languages: Lang[] = ["fi", "en", "se"];
export const defaultLanguage: Lang = "fi";

export function getLanguageFromUrl(url: URL | null): Lang {
  if (!url || !url.pathname) {
    return defaultLanguage;
  }
  
  const path = url.pathname;
  
  // Special cases for Finnish
  if (path === "/" || path === "/index.html" || path === "/ws-channel" || path === "/ws-api") {
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
  // Special case for root path with Finnish language
  if (lang === "fi") {
    if (
      pathname === "/" ||
      pathname === "/index.html" ||
      pathname === "/fi/index.html" ||
      pathname === "/fi"
    ) {
      return "/";
    }
    // Remove /fi/ prefix for Finnish URLs
    return pathname.replace(/^\/fi\//, "/");
  }

  // Remove existing language prefix if present
  const cleanPath = pathname.replace(/^\/(fi|en|se)/, "");

  // For non-Finnish languages or non-root paths, include language prefix
  return lang === "fi" ? cleanPath : `/${lang}${cleanPath}`;
}
