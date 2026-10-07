// Shared SEO primitives: canonical routes, hreflang alternates and JSON-LD
// nodes. Layouts and pages compose these instead of hand-writing the same
// Organization/WebSite/WebPage blocks and URL maps in several places.
import type { Lang } from "../types";

export const SITE_ORIGIN = "https://www.isecure.fi";
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const LOCALE_TAGS: Record<Lang, string> = {
  fi: "fi-FI",
  en: "en-US",
  se: "sv-SE",
};
export const localeTag = (lang: Lang): string => LOCALE_TAGS[lang];

export type JsonLdNode = Record<string, unknown>;
export type LocalizedRoutes = Record<Lang, string>;
export type Breadcrumb = { name: string; url: string };

/** Human page name for structured data: the document title without the brand suffix. */
export const pageName = (title: string): string =>
  title.replace(/\s*[|–-]\s*ISECure.*$/u, "").trim() || title;

/** Site-relative paths of one translated page; the empty slug is the homepage. */
export function localizedRoutes(slug = ""): LocalizedRoutes {
  const path = slug ? `/${slug}/` : "/";
  return { fi: path, en: `/en${path}`, se: `/se${path}` };
}

export const absoluteUrl = (path: string): string => `${SITE_ORIGIN}${path}`;

export type AlternateLink = { hreflang: string; href: string };

/** Reciprocal hreflang set with English as x-default for every translated page. */
export function alternateLinks(routes: LocalizedRoutes): AlternateLink[] {
  return [
    { hreflang: "fi", href: absoluteUrl(routes.fi) },
    { hreflang: "en", href: absoluteUrl(routes.en) },
    { hreflang: "sv", href: absoluteUrl(routes.se) },
    { hreflang: "x-default", href: absoluteUrl(routes.en) },
  ];
}

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "ISECure Oy",
    url: SITE_ORIGIN,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/images/isecure-small-logo.png`,
      width: 161,
      height: 61,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "FI",
      addressLocality: "Helsinki",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "sales@isecure.fi",
      telephone: "+358404835507",
      availableLanguage: ["Finnish", "English", "Swedish"],
    },
    sameAs: ["https://www.linkedin.com/company/1026241"],
  };
}

export function websiteNode(lang: Lang): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_ORIGIN,
    name: "ISECure",
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: localeTag(lang),
  };
}

export function webPageNode(page: {
  url: string;
  name: string;
  description: string;
  lang: Lang;
  type?: "WebPage" | "CollectionPage";
  about?: JsonLdNode;
  extra?: JsonLdNode;
}): JsonLdNode {
  return {
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    description: page.description,
    inLanguage: localeTag(page.lang),
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(page.about ? { about: page.about } : {}),
    ...page.extra,
  };
}

export function breadcrumbNode(items: ReadonlyArray<Breadcrumb>): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** FAQPage node, or undefined when there are no questions to publish. */
export function faqNode(
  items: ReadonlyArray<{ q: string; a: string }>,
): JsonLdNode | undefined {
  if (items.length === 0) return undefined;
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** One JSON-LD graph: site-wide Organization and WebSite plus the page's nodes. */
export function structuredDataGraph(
  lang: Lang,
  nodes: ReadonlyArray<JsonLdNode | undefined>,
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode(lang), ...nodes.filter(Boolean)],
  };
}
