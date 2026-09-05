import type { Lang } from "../types";

export const ANALYTICS_MEASUREMENT_ID = "G-BJ6B7H7K8E";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

interface LeadEvent {
  formName: string;
  leadType: string;
  language: Lang;
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
  if (globalThis.location.hostname !== "www.isecure.fi") return;
  if (typeof globalThis.window.gtag === "function") return;

  globalThis.window.dataLayer = globalThis.window.dataLayer ?? [];
  globalThis.window.gtag = function (..._args: unknown[]): void {
    // gtag.js interprets Arguments objects as commands; arrays use a different
    // data-layer protocol and silently leave config/event commands unprocessed.
    // eslint-disable-next-line prefer-rest-params -- Google's command protocol requires Arguments.
    globalThis.window.dataLayer?.push(arguments);
  };
  // Block Google's automatic DOM/data-layer scanning even if the account's
  // user-provided-data setting is enabled. Keep this before tag initialization.
  globalThis.window.gtag(
    "policy",
    "detect_user_provided_data",
    (): boolean => false,
  );
  // Advertising and user-provided-data collection stay disabled independently
  // of the site's automatic analytics policy. This does not display a prompt.
  globalThis.window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  globalThis.window.gtag("set", "user_data", null);
  globalThis.window.gtag("js", new Date());
  globalThis.window.gtag("config", ANALYTICS_MEASUREMENT_ID, {
    allow_ad_personalization_signals: false,
    allow_google_signals: false,
    user_data: null,
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

function installJourneyTracking(): void {
  globalThis.document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLElement>("[data-analytics-item-id]");
    if (!link) return;

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

export function initAnalytics(): void {
  loadAnalytics();
  installJourneyTracking();
}

export function trackLead({ formName, leadType, language }: LeadEvent): void {
  const browserWindow = globalThis.window;
  if (typeof browserWindow.gtag !== "function") return;

  browserWindow.gtag("event", "generate_lead", {
    form_name: formName,
    lead_type: leadType,
    language,
    page_path: browserWindow.location.pathname,
  });
}
