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
  
  // Don't add language prefix for default language unless it's not the root path
  if (lang === defaultLanguage && cleanPath === '/') {
    return '/';
  }
  
  // Add language prefix for other languages and non-root paths
  return lang === defaultLanguage ? cleanPath : `/${lang}${cleanPath}`;
}
