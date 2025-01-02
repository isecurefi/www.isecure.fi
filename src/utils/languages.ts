import type { Lang } from "../types";

export const languages: Lang[] = ["fi", "en", "se"];
export const defaultLanguage: Lang = "fi";

export function getLanguageFromUrl(url: URL | null): Lang {
  if (!url || !url.pathname) {
    return defaultLanguage;
  }
  const [, possibleLang] = url.pathname.split("/");
  // If no language code in URL or it's the root path, return Finnish
  if (!possibleLang || possibleLang === "index.html") {
    return "fi";
  }
  return languages.includes(possibleLang as Lang)
    ? (possibleLang as Lang)
    : defaultLanguage;
}

export function getLocalizedPathname(pathname: string, lang: Lang): string {
  // Special case for root path with Finnish language
  if (lang === "fi") {
    if (pathname === "/" || 
        pathname === "/index.html" || 
        pathname === "/fi/index.html" ||
        pathname === "/fi") {
      return "/";
    }
    // Remove /fi/ prefix for Finnish URLs
    return pathname.replace(/^\/fi\//, '/');
  }

  // Remove existing language prefix if present
  const cleanPath = pathname.replace(/^\/(fi|en|se)/, "");

  // For non-Finnish languages or non-root paths, include language prefix
  return lang === "fi" ? cleanPath : `/${lang}${cleanPath}`;
}
