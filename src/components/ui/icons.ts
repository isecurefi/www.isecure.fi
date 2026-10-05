// Stroke icons (24×24, currentColor) shared by IconTile and other UI parts.
export const icons = {
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
  shield:
    '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>',
  network:
    '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.5 12h7M8 10.5l7.8-4.3M8 13.5l7.8 4.3"/>',
  document: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 14l2 2 4-4"/>',
  flask:
    '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
  bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  refresh:
    '<path d="M20 11a8 8 0 0 0-14-5L4 8M4 13a8 8 0 0 0 14 5l2-2"/><path d="M4 4v4h4M20 20v-4h-4"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
} as const;

export type IconName = keyof typeof icons;

export const iconSvg = (name: IconName): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
