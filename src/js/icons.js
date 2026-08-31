/* ============================================================
   İKONLAR (basit çizgi SVG'ler — dış bağımlılık yok)
   ============================================================ */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5V4.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16.5 5.5a3.2 3.2 0 0 1 0 6.2"/><path d="M18 14.3c2.3.6 3.8 2.6 3.8 5.7"/>',
  school: '<path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 10.5V17c0 1.2 2.7 3 6 3s6-1.8 6-3v-6.5"/><path d="M22 8v7"/>',
  building: '<rect x="4" y="3" width="10" height="18" rx="1"/><rect x="16" y="9" width="5" height="12" rx="1"/><path d="M7.5 7h1M11 7h1M7.5 11h1M11 11h1M7.5 15h1M11 15h1"/>',
  shuffle: '<path d="M3 6h3.5c2 0 3 1 4.5 3M3 18h3.5c2 0 3-1 4.5-3M15 6h6M15 18h6"/><path d="M18 3.5 21 6l-3 2.5M18 20.5 21 18l-3-2.5M14 6l1.5-1.5M14 18l1.5 1.5"/>',
  grid: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  play: '<path d="M6 4.5v15l14-7.5-14-7.5Z"/>',
  new: '<path d="M12 4v16M4 12h16"/>',
  briefcase: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/><path d="M2.5 12.5h19"/>',
  note: '<path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v5h5"/><path d="M8 12h8M8 15.5h8M8 8.5h4"/>',
  chart: '<path d="M4 20V10M11 20V4M18 20v-7"/><path d="M2.5 20h19"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z"/>'
};
function icon(name) {
  const body = ICONS[name] || "";
  return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
