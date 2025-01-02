import type { Lang } from '../types';

export const languages: Lang[] = ['fi', 'en', 'se'];
export const defaultLanguage: Lang = 'fi';

export function getLanguageFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang && languages.includes(lang as Lang)) {
    return lang as Lang;
  }
  return defaultLanguage;
}

export function getLocalizedPathname(pathname: string, lang: Lang): string {
  // Remove existing language prefix if present
  const cleanPath = pathname.replace(/^\/(fi|en|se)/, '');
  
  // Don't add language prefix for default language
  if (lang === defaultLanguage) {
    return cleanPath || '/';
  }
  
  // Add language prefix for other languages
  return `/${lang}${cleanPath}`;
}
