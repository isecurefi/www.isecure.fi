import type { Lang } from "../types";

export const ANALYTICS_MEASUREMENT_ID = "G-BJ6B7H7K8E";
export const ANALYTICS_CONSENT_KEY = "isecure.analytics-consent.v1";

type AnalyticsConsent = "granted" | "denied";
type Gtag = (...args: unknown[]) => void;
let sessionConsent: AnalyticsConsent | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: Gtag;
  }
}

interface LeadEvent {
  formName: string;
  leadType: string;
  language: Lang;
}

function readConsent(): AnalyticsConsent | undefined {
  if (sessionConsent) return sessionConsent;
  try {
    const value = globalThis.localStorage?.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : undefined;
  } catch {
    return undefined;
  }
}

function storeConsent(consent: AnalyticsConsent): void {
  sessionConsent = consent;
  try {
    globalThis.localStorage?.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // The choice still applies to this page view when storage is unavailable.
  }
}

function disableAnalytics(): void {
  const browserWindow = globalThis.window as Window & Record<string, unknown>;
  browserWindow[`ga-disable-${ANALYTICS_MEASUREMENT_ID}`] = true;
  browserWindow.gtag?.("consent", "update", {
    analytics_storage: "denied",
  });

  for (const cookie of globalThis.document.cookie.split(";")) {
    const name = cookie.split("=", 1)[0]?.trim();
    if (!name?.startsWith("_ga")) continue;
    for (const domain of ["", "; domain=.isecure.fi"]) {
      globalThis.document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;
    }
  }
}

function sanitizedLocation(): string {
  return `${globalThis.location.origin}${globalThis.location.pathname}`;
}

function sanitizedReferrer(): string | undefined {
  if (!globalThis.document.referrer) return undefined;
  try {
    const referrer = new URL(globalThis.document.referrer);
    return `${referrer.origin}${referrer.pathname}`;
  } catch {
    return undefined;
  }
}

function loadAnalytics(): void {
  if (readConsent() !== "granted") return;
  const browserWindow = globalThis.window as Window & Record<string, unknown>;
  browserWindow[`ga-disable-${ANALYTICS_MEASUREMENT_ID}`] = false;
  if (typeof globalThis.window.gtag === "function") return;

  globalThis.window.dataLayer = globalThis.window.dataLayer ?? [];
  globalThis.window.gtag = (...args: unknown[]): void => {
    globalThis.window.dataLayer?.push(args);
  };
  globalThis.window.gtag("js", new Date());
  globalThis.window.gtag("config", ANALYTICS_MEASUREMENT_ID, {
    allow_ad_personalization_signals: false,
    allow_google_signals: false,
    page_location: sanitizedLocation(),
    page_path: globalThis.location.pathname,
    page_referrer: sanitizedReferrer(),
  });

  if (!globalThis.document.getElementById("isecure-google-analytics")) {
    const script = globalThis.document.createElement("script");
    script.id = "isecure-google-analytics";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ANALYTICS_MEASUREMENT_ID)}`;
    globalThis.document.head.append(script);
  }
}

function hideConsent(element: HTMLElement): void {
  element.hidden = true;
}

function showConsent(element: HTMLElement, moveFocus = false): void {
  element.hidden = false;
  if (moveFocus) {
    element
      .querySelector<HTMLElement>("[data-analytics-consent-heading]")
      ?.focus();
  }
}

function installJourneyTracking(): void {
  globalThis.document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLElement>("[data-analytics-item-id]");
    if (!link || readConsent() !== "granted") return;

    const contentType = link.dataset.analyticsContentType;
    const itemId = link.dataset.analyticsItemId;
    const sourceSurface = link.dataset.analyticsSource;
    if (!contentType || !itemId || !sourceSurface) return;

    globalThis.window.gtag?.("event", "select_content", {
      content_type: contentType,
      item_id: itemId,
      source_surface: sourceSurface,
      language: globalThis.document.body.dataset.analyticsLanguage,
      page_path: globalThis.location.pathname,
    });
  });
}

export function initAnalyticsConsent(): void {
  const consentElement = globalThis.document.querySelector<HTMLElement>(
    "[data-analytics-consent]",
  );
  if (!consentElement) return;

  consentElement
    .querySelector<HTMLElement>("[data-analytics-accept]")
    ?.addEventListener("click", () => {
      storeConsent("granted");
      hideConsent(consentElement);
      loadAnalytics();
    });
  consentElement
    .querySelector<HTMLElement>("[data-analytics-reject]")
    ?.addEventListener("click", () => {
      storeConsent("denied");
      disableAnalytics();
      hideConsent(consentElement);
    });
  globalThis.document
    .querySelectorAll<HTMLElement>("[data-analytics-settings]")
    .forEach((button) => {
      button.addEventListener("click", () => showConsent(consentElement, true));
    });

  const consent = readConsent();
  if (consent === "granted") {
    hideConsent(consentElement);
    loadAnalytics();
  } else {
    disableAnalytics();
    if (consent === undefined) showConsent(consentElement);
    else hideConsent(consentElement);
  }
  installJourneyTracking();
}

export function trackLead({ formName, leadType, language }: LeadEvent): void {
  const browserWindow = globalThis.window;
  if (readConsent() !== "granted" || typeof browserWindow.gtag !== "function") {
    return;
  }

  browserWindow.gtag("event", "generate_lead", {
    form_name: formName,
    lead_type: leadType,
    language,
    page_path: browserWindow.location.pathname,
  });
}
