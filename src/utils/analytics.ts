import type { Lang } from "../types";

type Gtag = (
  command: "event",
  eventName: string,
  parameters?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

interface LeadEvent {
  formName: string;
  leadType: string;
  language: Lang;
  topic?: string;
}

export function trackLead({
  formName,
  leadType,
  language,
  topic,
}: LeadEvent): void {
  const browserWindow = globalThis.window;
  if (typeof browserWindow.gtag !== "function") {
    return;
  }

  browserWindow.gtag("event", "generate_lead", {
    form_name: formName,
    lead_type: leadType,
    language,
    topic: topic || undefined,
    page_path: browserWindow.location.pathname,
  });
}
