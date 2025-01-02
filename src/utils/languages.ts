import type { Lang } from '../types';

export const languages: Lang[] = ['fi', 'en', 'se'];
export const defaultLanguage: Lang = 'fi';

export function getLanguageFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  return (lang && languages.includes(lang as Lang)) ? (lang as Lang) : defaultLanguage;
}

export function getLocalizedPathname(pathname: string, lang: Lang): string {
  // Remove existing language prefix if present
  const cleanPath = pathname.replace(/^\/(fi|en|se)/, '');
  
  // Always include language prefix
  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}
