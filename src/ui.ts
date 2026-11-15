/** Inline, same-stroke icons. No remote assets or runtime dependencies. */
export function icon(name: string, size = 22) {
  const paths: Record<string, string> = {
    notes: '<path d="M8 3h11v18H5V3h3m1-1v4m4-4v4M8 10h8M8 14h8M8 18h5"/>',
    hint: '<path d="M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    objects: '<path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/>',
    map: '<path d="M3 7V4h7l2 3h9v14H3V7Z"/><path d="m7 14 3-3 4 5 3-3"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    lift: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 8v12m-5-8 2-2 2 2m2 4 2 2 2-2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
    sound:
      '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    location:
      '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.notes}</svg>`;
}
export const anchors: Record<string, "above" | "below" | "left" | "right"> = {
  allie: "left",
  ledger: "below",
  plan: "below",
  cctv: "below",
  noah: "right",
  panel: "left",
  photo: "above",
  wiwo: "left",
  tedar: "right",
  parcel: "below",
  access: "above",
  lock: "above",
  stairs: "below",
  yono: "left",
  manifest: "above",
  conclusion: "below",
};
