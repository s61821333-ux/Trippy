/* Trippy Icon Library — path data
 * All UI / event / supply icons: viewBox "0 0 24 24", stroke 1.5,
 * round caps/joins, fill: none — color via currentColor.
 * Trip-type badges: viewBox "0 0 48 48", filled, 2-3 brand colors.
 * Stickers: viewBox "0 0 64 64", illustrated, 3 colors max.
 *
 * Brand palette:
 *   --forest #3B6E52  --terra #C4714A  --gold #C8944A
 *   --paper  #F4EFE8  --ink   #1A1410
 *   --forest-lt #8BB39A  --terra-lt #E0916B  --gold-lt #E6B574
 */

// ─── 1 · UI icons (24x24 line) ────────────────────────────────────────
const UI_ICONS = [
  { key:'home', svg:`<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6h-6v6H4.5a1 1 0 0 1-1-1z"/>` },
  { key:'calendar', svg:`<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>` },
  { key:'checklist', svg:`<path d="M4 6.5l1.6 1.6L8.8 5M13 6.5h7M4 12.5l1.6 1.6L8.8 11M13 12.5h7M4 18.5l1.6 1.6L8.8 17M13 18.5h6"/>` },
  { key:'settings', svg:`<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H4a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h.1a1.6 1.6 0 0 0 1-1.5V4a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v.1a1.6 1.6 0 0 0 1.5 1H20a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>` },
  { key:'plus', svg:`<path d="M12 5v14M5 12h14"/>` },
  { key:'chevR', svg:`<path d="M9 5l7 7-7 7"/>` },
  { key:'chevL', svg:`<path d="M15 5l-7 7 7 7"/>` },
  { key:'share', svg:`<path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/>` },
  { key:'map', svg:`<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>` },
  { key:'sparkle', svg:`<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>` },
  { key:'trash', svg:`<path d="M4 7h16M10 11v6M14 11v6M6 7l.9 12.1A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 7M9 7V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5V7"/>` },
  { key:'edit', svg:`<path d="M4 20.5h4l11-11-4-4-11 11zM14.5 6l4 4M4 20.5l1-4"/>` },
  { key:'x', svg:`<path d="M6 6l12 12M18 6L6 18"/>` },
  { key:'check', svg:`<path d="M5 12l5 5L20 7"/>` },
  { key:'sun', svg:`<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>` },
  { key:'wind', svg:`<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8a3 3 0 1 0-3-3"/>` },
  { key:'lock', svg:`<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>` },
  { key:'pin', svg:`<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>` },
  { key:'download', svg:`<path d="M12 4v12M8 12l4 4 4-4M5 20h14"/>` },
  { key:'compass', svg:`<circle cx="12" cy="12" r="9"/><path d="M15 9l-1.6 4.4L9 15l1.6-4.4z"/>` },
  { key:'tent', svg:`<path d="M3 20L12 4l9 16M12 4v16M9 20l3-4 3 4"/>` },
  { key:'water', svg:`<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/>` },
  { key:'calExport', svg:`<rect x="3" y="5" width="13" height="15.5" rx="2"/><path d="M3 9.5h13M7 3v4M12 3v4M14 14h7M18 11l3 3-3 3"/>` },
  { key:'user', svg:`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>` },
  { key:'search', svg:`<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>` },
  { key:'filter', svg:`<path d="M3 5h18l-7 8v7l-4-2v-5z"/>` },
  { key:'ai', svg:`<path d="M13 3L5 13h6l-2 8 10-12h-7z"/>` },
  { key:'clock', svg:`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>` },
  { key:'arrow', svg:`<path d="M5 12h14M13 6l6 6-6 6"/>` },
  { key:'menu', svg:`<path d="M4 7h16M4 12h16M4 17h16"/>` },
  { key:'grid', svg:`<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>` },
];

// ─── 2 · Event category icons (24x24 line + color token) ─────────────
// color names map to brand swatches rendered by the showcase.
const EVENT_GROUPS = [
  {
    title: 'Food & Drink',
    icons: [
      { key:'food', color:'amber', svg:`<path d="M7 3v8a2 2 0 0 0 2 2v8M9 3v6M5 3v6M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>` },
      { key:'cafe', color:'brown', svg:`<path d="M4 11h12v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 12h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2M7 3c-.5 1 .5 2 0 3M11 3c-.5 1 .5 2 0 3"/>` },
      { key:'breakfast', color:'gold', svg:`<circle cx="12.5" cy="13" r="3"/><path d="M5 13a6 6 0 0 1 11.5-2.5A4.5 4.5 0 0 1 16 19h-6a5 5 0 0 1-5-5z"/>` },
      { key:'street_food', color:'coral', svg:`<path d="M4 4l16 16"/><circle cx="9" cy="9" r="2"/><circle cx="13" cy="13" r="2"/><circle cx="17" cy="17" r="2"/>` },
      { key:'fine_dining', color:'gold', svg:`<path d="M3 19h18M5 19a7 7 0 0 1 14 0M12 5v2M10 5h4"/>` },
      { key:'bar', color:'rose', svg:`<path d="M4 5h16l-7 8v6M9 19h6M7 9h10"/>` },
      { key:'winery', color:'terra', svg:`<path d="M7 3h10l-1 6a4 4 0 0 1-8 0zM12 13v7M9 20h6"/>` },
      { key:'brewery', color:'gold', svg:`<path d="M5 8h11v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM16 11h2a2 2 0 0 1 0 4h-2M7 4v3M11 4v3M15 4v3"/>` },
      { key:'bakery', color:'amber', svg:`<path d="M4 18c1-5 4-8 8-9s7 1 8 4c-1 5-4 8-8 9s-7-1-8-4zM8 16c1-3 3-5 6-6M12 11c1-3 3-4 5-4"/>` },
      { key:'dessert', color:'rose', svg:`<path d="M8 9a4 4 0 0 1 8 0v1H8zM9 11l3 10 3-10"/>` },
      { key:'picnic', color:'forest', svg:`<path d="M4 10h16l-1 9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM7 10a5 5 0 0 1 10 0M4 14h16M9 10v11M15 10v11"/>` },
      { key:'market_food', color:'terra', svg:`<path d="M3 8l9-4 9 4M5 8v11h14V8M9 8v11M15 8v11"/>` },
    ],
  },
  {
    title: 'Accommodation',
    icons: [
      { key:'hotel', color:'purple', svg:`<rect x="4" y="4" width="16" height="17" rx="1.5"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M10 21v-5h4v5"/>` },
      { key:'hostel', color:'purple', svg:`<path d="M4 5h16v6H4zM4 13h16v6H4zM4 5v14M20 5v14M8 8h6M8 16h6"/>` },
      { key:'camp', color:'forest', svg:`<path d="M3 19L11 6l8 13M11 6v13M8 19l3-4 3 4"/><circle cx="18" cy="6" r="1.5"/>` },
      { key:'glamping', color:'forest', svg:`<path d="M4 18a8 8 0 0 1 16 0zM4 18h16M12 11v7M8 14l-.5 4M16 14l.5 4"/>` },
      { key:'airbnb', color:'coral', svg:`<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 14a1.5 1.5 0 0 1 3-1 1.5 1.5 0 0 1 3 1c0 1.7-3 3.5-3 3.5S9 15.7 9 14z"/>` },
      { key:'resort', color:'cyan', svg:`<path d="M12 21V11M12 11c-4-2-7-1-8 1 3-1 5 0 7 1M12 11c4-2 7-1 8 1-3-1-5 0-7 1M12 11c-2-3-1-6 1-7-1 3 0 5 1 6M12 11c2-3 1-6-1-7 1 3 0 5-1 6"/>` },
      { key:'cabin', color:'brown', svg:`<path d="M3 11l9-6 9 6v10H3zM3 13h18M3 16h18M3 19h18M9 21v-5h6v5"/>` },
      { key:'boat', color:'navy', svg:`<path d="M3 17a2 2 0 0 0 2 1c2 0 2-1 4-1s2 1 4 1 2-1 4-1a2 2 0 0 0 2-1L18 11H6zM12 5v6"/>` },
    ],
  },
  {
    title: 'Transport',
    icons: [
      { key:'flight', color:'navy', svg:`<path d="M19.5 4c1 0 1.5 1 .5 2l-4 4 2 7-2 1-3-5-4 3v3l-1 1-1.5-3L3 15.5l1-1h3l3-4-5-2 1-2 7 1.5 4-3.5c0-.5.5-.5 1-.5z"/>` },
      { key:'drive', color:'blue', svg:`<path d="M4 14l1.2-5a2 2 0 0 1 2-2h9.6a2 2 0 0 1 2 2L20 14M3 14h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM7 17h1M16 17h1"/>` },
      { key:'train', color:'blue', svg:`<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 7h6M7 21l2-2M17 21l-2-2"/><circle cx="8.5" cy="14" r=".7" fill="currentColor" stroke="none"/><circle cx="15.5" cy="14" r=".7" fill="currentColor" stroke="none"/>` },
      { key:'bus', color:'gold', svg:`<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 8h10M6 21l1-2M18 21l-1-2"/><circle cx="7.5" cy="14" r=".7" fill="currentColor" stroke="none"/><circle cx="16.5" cy="14" r=".7" fill="currentColor" stroke="none"/>` },
      { key:'ferry', color:'teal', svg:`<path d="M3 16a3 3 0 0 0 3 1c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1a3 3 0 0 0 3-1l-2-4H5zM5 12V8h14v4M12 4v4"/>` },
      { key:'taxi', color:'gold', svg:`<rect x="4" y="10" width="16" height="9" rx="2"/><path d="M4 14h16M10 6h4v4M6 21v-2M18 21v-2"/>` },
      { key:'metro', color:'coral', svg:`<circle cx="12" cy="12" r="9"/><path d="M8 16V8l4 5 4-5v8"/>` },
      { key:'bike', color:'forest', svg:`<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l3-8h4l3 8M9 9H7M13 9l2-3h2"/>` },
      { key:'motorbike', color:'slate', svg:`<circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17l4-5h7l3 5M14 8h4l-2 4M9 12h7"/>` },
      { key:'boat_transfer', color:'cyan', svg:`<path d="M3 16l8-9 3 2 4-1 4 4M3 16h18M5 19c2 0 3-1 5-1s3 1 5 1 3-1 5-1"/>` },
      { key:'cable_car', color:'coral', svg:`<path d="M3 4l18 4M6 7v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6M10 12v8M14 12v8"/>` },
      { key:'gas', color:'slate', svg:`<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16zM5 12h9M15 10v6a2 2 0 0 0 4 0V8l-2-2"/>` },
      { key:'parking', color:'slate', svg:`<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9 17V8h4a3 3 0 0 1 0 6H9"/>` },
    ],
  },
  {
    title: 'Sightseeing & Culture',
    icons: [
      { key:'attraction', color:'teal', svg:`<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>` },
      { key:'museum', color:'gold', svg:`<path d="M3 9l9-5 9 5v2H3zM5 11v8M9 11v8M15 11v8M19 11v8M3 21h18"/>` },
      { key:'art_gallery', color:'purple', svg:`<rect x="4" y="4" width="16" height="16" rx="1.5"/><circle cx="9" cy="9" r="1.5"/><path d="M20 16l-5-5-8 9"/>` },
      { key:'landmark', color:'slate', svg:`<path d="M10 21V12h4v9M12 12V8M9 8h6M11 8V4h2v4M12 4l-1-2M12 4l1-2M9 21h6"/>` },
      { key:'ruins', color:'slate', svg:`<path d="M4 21V12h3l1-3h1l1 3v4M14 21V9l1-3h2l1 3v12M4 21h16M5 14h6M14 16h6"/>` },
      { key:'religious_site', color:'gold', svg:`<path d="M5 21V12a7 7 0 0 1 14 0v9M12 5V3M9 12h6M5 21h14M10 21v-5a2 2 0 0 1 4 0v5"/>` },
      { key:'viewpoint', color:'slate', svg:`<path d="M3 14a3 3 0 0 0 6 0V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zM15 14a3 3 0 0 0 6 0V6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zM9 7h6M9 10h6"/>` },
      { key:'castle', color:'slate', svg:`<path d="M3 21V8h2V5h2v3h2V5h2v3h2V5h2v3h2V5h2v3h2v13zM3 13h18M9 21v-4h6v4M14 5V2h4v3"/>` },
      { key:'neighborhood', color:'slate', svg:`<path d="M3 21V11l4-3v13M9 21V7l5-3v17M16 21V11l5-3v13M3 21h18M10 13h3M10 17h3M17 13h3M17 17h3"/>` },
      { key:'street_art', color:'purple', svg:`<path d="M5 20l3-7 7 3-3 7zM8 13l3-3M11 6h2M16 4l1 2M20 7l-2 1M20 11l-2-1"/>` },
      { key:'market', color:'coral', svg:`<path d="M4 9l1-5h14l1 5M4 9c0 2 2 3 4 1 2 2 4 2 6 0 2 2 4 2 6-1M4 9v12h16V9M9 21v-6h6v6"/>` },
      { key:'show', color:'rose', svg:`<path d="M4 4h16v4c-2 0-3 1-3 3v10h-4M20 8c-2 0-3 1-3 3M4 8c2 0 3 1 3 3v10h4M11 21V11"/>` },
      { key:'concert', color:'blue', svg:`<path d="M9 17V5l10-2v12M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 15a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM9 9l10-2"/>` },
      { key:'sports_event', color:'gold', svg:`<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4M10 14l-1 4h6l-1-4M8 20h8"/>` },
      { key:'festival', color:'rose', svg:`<path d="M5 19l4-10 6 6zM9 9l5-3M15 4l1 2M19 5l-1 2M20 9h-2M19 13l-1-1M14 14l2-2"/>` },
    ],
  },
  {
    title: 'Outdoor & Adventure',
    icons: [
      { key:'hike', color:'brown', svg:`<path d="M5 18v-7h4v3l5 2 4 1v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM9 11V4h2v7M5 15h4M11 13h2M14 14h2M17 15h2"/>` },
      { key:'beach', color:'cyan', svg:`<path d="M3 11a9 9 0 0 1 18 0c-2-1-3-1-5 0-2-1-3-1-5 0-2-1-3-1-5 0M12 11v8M12 2v2M3 20c2 0 3-1 4-1s2 1 4 1 3-1 4-1 3 1 4 1"/>` },
      { key:'swim', color:'cyan', svg:`<path d="M3 17c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 3 1M3 21c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 3 1M9 13l3-3 4 3"/><circle cx="13" cy="6" r="2"/>` },
      { key:'snorkel', color:'cyan', svg:`<path d="M4 9h11a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3l-1-2h-2l-1 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 0-2zM17 11h3v9"/>` },
      { key:'surf', color:'blue', svg:`<path d="M12 3c4 0 8 4 8 11 0 5-2 7-4 7-3 0-2-3-5-6s-7-2-7-5c0-3 4-7 8-7zM10 15l5-5"/>` },
      { key:'kayak', color:'forest', svg:`<path d="M4 4l16 16M4 20L20 4M8 8l3-3 3 3-3 3zM13 13l3-3 3 3-3 3z"/>` },
      { key:'sail', color:'blue', svg:`<path d="M5 18l7-13v13zM4 21h16M14 7l4 11h-4"/>` },
      { key:'ski', color:'cyan', svg:`<path d="M5 4l8 18M11 4l8 18M5 4l3-1M19 22l-3 1M11 4l3-1M13 22l3 1"/>` },
      { key:'climb', color:'slate', svg:`<circle cx="9" cy="5" r="2"/><path d="M9 7v4l4 2 2-3 3 2-2 4-4-1-1 9-3-8-5 2 1-4 5-1"/>` },
      { key:'cycling', color:'forest', svg:`<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><circle cx="15" cy="5" r="1.5"/><path d="M6 17l4-6h4l-2-4M10 11l5 6"/>` },
      { key:'paraglide', color:'cyan', svg:`<path d="M3 8c3-2 6-3 9-3s6 1 9 3l-2 3-3-2-2 2-2-2-2 2-3 2zM12 11v6l-2 3M12 17l2 3"/>` },
      { key:'safari', color:'gold', svg:`<path d="M3 14l1-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2l1 4M3 14h18v3a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1zM8 10V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3"/>` },
      { key:'diving', color:'navy', svg:`<path d="M4 9h11a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3l-1-2h-2l-1 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 0-2z"/><circle cx="19" cy="6" r="1"/><circle cx="21" cy="9" r=".7"/><circle cx="20" cy="4" r=".7"/>` },
      { key:'horseback', color:'brown', svg:`<path d="M4 18c0-4 3-7 7-7h5l4-3v3l-1 1 1 2-2 1v3l-2 1M16 18l-1-3h-4l-1 4-2-1 1-3-2-1"/>` },
    ],
  },
  {
    title: 'Wellness & Rest',
    icons: [
      { key:'rest', color:'forest', svg:`<path d="M3 20L12 4l9 16M12 4v16M9 20l3-4 3 4"/>` },
      { key:'spa', color:'rose', svg:`<path d="M12 19c-2 0-4-2-4-4 0-1 2-2 4-2s4 1 4 2c0 2-2 4-4 4zM6 12c0-3 3-7 6-7s6 4 6 7M10 9c0-2 1-4 2-4s2 2 2 4M7 14c-2-1-3-1-4-1 0 2 2 3 4 3M17 14c2-1 3-1 4-1 0 2-2 3-4 3"/>` },
      { key:'yoga', color:'purple', svg:`<circle cx="12" cy="6" r="2"/><path d="M5 19c2 0 5-2 7-2s5 2 7 2M8 13c2 1 5 1 8 0M12 8v5"/>` },
      { key:'meditation', color:'purple', svg:`<circle cx="12" cy="6" r="2"/><path d="M5 20c2 0 5-2 7-2s5 2 7 2M12 8c-3 2-4 5-4 9M12 8c3 2 4 5 4 9M8 17h8"/>` },
      { key:'sleep', color:'navy', svg:`<path d="M11 4a8 8 0 1 0 9 9 6 6 0 0 1-9-9z"/><path d="M16 5h3l-3 3h3"/>` },
      { key:'hot_spring', color:'rose', svg:`<path d="M3 17c2 0 3-1 4.5-1S10 17 12 17s3-1 4.5-1S19 17 21 17M3 21c2 0 3-1 4.5-1S10 21 12 21s3-1 4.5-1S19 21 21 21M8 11c0-2 2-3 2-5M12 11c0-2 2-3 2-5M16 11c0-2 2-3 2-5"/>` },
    ],
  },
  {
    title: 'Photo & Creative',
    icons: [
      { key:'photo', color:'slate', svg:`<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l2-3h4l2 3"/>` },
      { key:'video', color:'coral', svg:`<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11l5-3v8l-5-3z"/>` },
      { key:'sketching', color:'brown', svg:`<path d="M5 21V5a2 2 0 0 1 2-2h7l5 5v6M14 3v5h5"/><path d="M13 21l1-3 4-4 2 2-4 4z"/>` },
      { key:'journaling', color:'brown', svg:`<path d="M5 4h11a2 2 0 0 1 2 2v15H7a2 2 0 0 1-2-2zM5 19a2 2 0 0 1 2-2h11M9 8h6M9 12h4"/>` },
    ],
  },
  {
    title: 'Practical & Logistics',
    icons: [
      { key:'check_in', color:'teal', svg:`<path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M3 12h11M10 8l4 4-4 4"/>` },
      { key:'check_out', color:'coral', svg:`<path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M21 12H10M17 8l4 4-4 4"/>` },
      { key:'border_crossing', color:'navy', svg:`<path d="M5 21V4l10 3-10 3M5 21v-8M19 21V11l-4-1"/>` },
      { key:'visa', color:'forest', svg:`<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="5" stroke-dasharray="2 1.5"/><path d="M9 12l2 2 4-4"/>` },
      { key:'currency_exchange', color:'gold', svg:`<path d="M3 8h14l-3-3M21 16H7l3 3"/><circle cx="5" cy="19" r="1.5"/><circle cx="19" cy="5" r="1.5"/>` },
      { key:'sim_card', color:'slate', svg:`<path d="M6 4h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 12h8v8H8zM8 16h8M12 12v8"/>` },
      { key:'insurance', color:'blue', svg:`<path d="M12 3l8 3v6c0 4-4 8-8 9-4-1-8-5-8-9V6z"/><path d="M9 12l2 2 4-4"/>` },
      { key:'packing', color:'brown', svg:`<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/>` },
    ],
  },
];

// ─── 3 · Supply icons (24x24 line) ──────────────────────────────────
const SUPPLY_ICONS = [
  { key:'water', svg:`<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/>` },
  { key:'food_supplies', svg:`<path d="M5 12a7 7 0 0 1 14 0v1H5zM5 13h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM5 16h14"/>` },
  { key:'gear', svg:`<path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M5 9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM9 12h6v3H9z"/>` },
  { key:'medical', svg:`<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M12 10v6M9 13h6M8 6V4h8v2"/>` },
  { key:'documents', svg:`<path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 13h6M9 17h4"/>` },
  { key:'clothing', svg:`<path d="M9 3l3 2 3-2 5 3-2 4-3-1v12H8V9L5 10 3 6z"/>` },
  { key:'footwear', svg:`<path d="M5 5h3v8l8 2 3 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 9h2M8 12h4"/>` },
  { key:'electronics', svg:`<path d="M7 3v5h10V3M9 8v3a3 3 0 0 0 6 0V8M11 14l2-2-1 4 2-2"/>` },
  { key:'navigation', svg:`<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 2 2-6z"/>` },
  { key:'shelter', svg:`<path d="M4 18L12 6l8 12M12 6v12M9 18l3-3 3 3"/><path d="M5 4l1 2M9 3v2M19 4l-1 2"/>` },
  { key:'fire_making', svg:`<path d="M12 22c-3 0-6-2-6-6 0-3 2-5 3-5s1 1 1 2c0-3 2-5 3-7 1 3 5 5 5 10 0 4-3 6-6 6z"/>` },
  { key:'tools', svg:`<path d="M14 5l4-2v3l3 3-3 3v3l-4-2-4 6-2 4-3-1 1-3 6-4z"/>` },
  { key:'hygiene', svg:`<path d="M4 12l3-3 9 9-3 3zM15 17l3-9 1 1-3 9M9 9l3-3"/>` },
  { key:'sun_protection', svg:`<path d="M12 3l8 3v6c0 4-4 8-8 9-4-1-8-5-8-9V6z"/><circle cx="12" cy="11" r="2"/><path d="M12 6v1M12 15v1M8 11h1M15 11h1M9 8l1 1M14 13l1 1M9 14l1-1M14 9l1-1"/>` },
  { key:'insect_protection', svg:`<circle cx="12" cy="13" r="4"/><path d="M12 9V6M9 9L7 7M15 9l2-2M8 13H5M16 13h3M9 17l-2 2M15 17l2 2"/><path d="M3 5l3 3M6 5L3 8"/>` },
  { key:'camera_gear', svg:`<rect x="3" y="8" width="14" height="11" rx="2"/><circle cx="10" cy="13.5" r="3"/><path d="M17 11h4v5h-4"/>` },
  { key:'snacks', svg:`<rect x="4" y="9" width="16" height="6" rx="2"/><path d="M7 9v6M11 9v6M15 9v6"/>` },
  { key:'safety', svg:`<path d="M4 17v-3a8 8 0 0 1 16 0v3M3 17h18v3H3zM10 7v3M14 7v3"/>` },
  { key:'communication', svg:`<rect x="9" y="3" width="6" height="18" rx="1"/><path d="M9 7h6M11 18h2M16 6l3-3M17 9h3M16 12l3 3"/>` },
  { key:'entertainment', svg:`<path d="M4 14v-2a8 8 0 0 1 16 0v2M3 14h4v6H4a1 1 0 0 1-1-1zM17 14h4v5a1 1 0 0 1-1 1h-3z"/>` },
];

// ─── 4 · Trip Type Badges (48x48 filled, 2-3 brand colors) ─────────
// "f" = forest, "t" = terra, "g" = gold, "p" = paper, "i" = ink
// Badges are circular w/ brand bg + paper silhouette + accent detail.
const TRIP_TYPES = [
  // road_trip — steering wheel
  { key:'road_trip', bg:'t', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--t)"/>
    <circle cx="24" cy="24" r="11" fill="none" stroke="var(--p)" stroke-width="2.5"/>
    <circle cx="24" cy="24" r="3" fill="var(--p)"/>
    <path d="M24 16v-3M24 32v3M16 24h-3M32 24h3" stroke="var(--p)" stroke-width="2.5" stroke-linecap="round"/>` },
  // backpacking — backpack
  { key:'backpacking', bg:'f', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--f)"/>
    <path d="M18 13h12v3h2v18a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V16h2zM18 13a3 3 0 0 1 6 0M30 13a3 3 0 0 0-6 0" fill="none" stroke="var(--p)" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="18" y="20" width="12" height="5" rx="1" fill="var(--g)"/>` },
  // luxury — champagne flute + star
  { key:'luxury', bg:'g', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--g)"/>
    <path d="M18 12h12l-1 9a5 5 0 0 1-10 0zM24 26v9M20 35h8" fill="none" stroke="var(--i)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M34 14l1.2 2.4L38 17l-2.4.6L34 20l-.6-2.4L31 17l2.4-.6z" fill="var(--p)"/>` },
  // family — adults + child
  { key:'family', bg:'f', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--f)"/>
    <circle cx="15" cy="17" r="3" fill="var(--p)"/>
    <circle cx="33" cy="17" r="3" fill="var(--p)"/>
    <circle cx="24" cy="22" r="2.5" fill="var(--g)"/>
    <path d="M10 35c0-4 2-7 5-7s5 3 5 7M28 35c0-4 2-7 5-7s5 3 5 7M20 38c0-3 2-5 4-5s4 2 4 5" fill="var(--p)"/>
    <path d="M24 33c-2 0-4 2-4 5h8c0-3-2-5-4-5z" fill="var(--g)"/>` },
  // couple — linked rings
  { key:'couple', bg:'t', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--t)"/>
    <circle cx="18" cy="24" r="8" fill="none" stroke="var(--p)" stroke-width="3"/>
    <circle cx="30" cy="24" r="8" fill="none" stroke="var(--g)" stroke-width="3"/>` },
  // solo — person + globe
  { key:'solo', bg:'g', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--g)"/>
    <circle cx="18" cy="18" r="4" fill="var(--i)"/>
    <path d="M10 36c0-5 4-9 8-9s8 4 8 9" fill="var(--i)"/>
    <circle cx="32" cy="30" r="7" fill="none" stroke="var(--p)" stroke-width="2"/>
    <path d="M25 30h14M32 23a10 10 0 0 1 0 14M32 23a10 10 0 0 0 0 14" fill="none" stroke="var(--p)" stroke-width="1.6"/>` },
  // group_friends — three overlapping
  { key:'group_friends', bg:'f', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--f)"/>
    <circle cx="14" cy="18" r="4" fill="var(--p)"/>
    <circle cx="34" cy="18" r="4" fill="var(--p)"/>
    <circle cx="24" cy="16" r="4.5" fill="var(--g)"/>
    <path d="M6 36c0-5 4-8 8-8s8 3 8 8M26 36c0-5 4-8 8-8s8 3 8 8" fill="var(--p)"/>
    <path d="M14 38c0-6 4-10 10-10s10 4 10 10" fill="var(--g)"/>` },
  // business — briefcase
  { key:'business', bg:'i', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--i)"/>
    <rect x="11" y="18" width="26" height="17" rx="2" fill="var(--p)"/>
    <path d="M19 18v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" fill="none" stroke="var(--p)" stroke-width="2.2"/>
    <rect x="22" y="22" width="4" height="3" rx=".5" fill="var(--t)"/>
    <path d="M11 26h26" stroke="var(--i)" stroke-width="1.5"/>` },
  // digital_nomad — laptop + palm
  { key:'digital_nomad', bg:'t', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--t)"/>
    <rect x="12" y="24" width="20" height="11" rx="1.5" fill="var(--p)"/>
    <rect x="14" y="26" width="16" height="7" fill="var(--i)"/>
    <path d="M10 36h28" stroke="var(--p)" stroke-width="2" stroke-linecap="round"/>
    <path d="M38 22V11M38 11c-3-1-5 0-6 2 2 0 4 1 5 2M38 11c3-1 5 0 6 2-2 0-4 1-5 2" fill="var(--g)"/>` },
  // pilgrimage — staff + path
  { key:'pilgrimage', bg:'f', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--f)"/>
    <path d="M20 36L20 12L17 14" fill="none" stroke="var(--p)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M10 36c4-2 6-6 10-6s6 4 10 6" fill="none" stroke="var(--g)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="20" cy="11" r="2" fill="var(--g)"/>` },
  // expedition — compass + flag
  { key:'expedition', bg:'i', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--i)"/>
    <circle cx="20" cy="24" r="10" fill="none" stroke="var(--p)" stroke-width="2"/>
    <path d="M24 20l-1.5 4.5L18 26l1.5-4.5z" fill="var(--t)"/>
    <path d="M34 12v22M34 12l-6 2 6 2z" fill="var(--g)" stroke="var(--g)" stroke-width="2" stroke-linejoin="round"/>` },
  // cruise — ship
  { key:'cruise', bg:'t', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--t)"/>
    <path d="M9 28a4 4 0 0 0 4 2c3 0 3-2 5-2s2 2 6 2 4-2 6-2 2 2 5 2a4 4 0 0 0 4-2l-3-6H12z" fill="var(--p)"/>
    <rect x="14" y="14" width="20" height="8" fill="var(--g)"/>
    <path d="M18 14h2v2h-2zM22 14h2v2h-2zM26 14h2v2h-2zM30 14h2v2h-2z" fill="var(--i)"/>
    <path d="M24 14V9" stroke="var(--p)" stroke-width="1.5"/>` },
  // cycling_tour — loaded bike
  { key:'cycling_tour', bg:'f', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--f)"/>
    <circle cx="14" cy="32" r="5" fill="none" stroke="var(--p)" stroke-width="2"/>
    <circle cx="34" cy="32" r="5" fill="none" stroke="var(--p)" stroke-width="2"/>
    <path d="M14 32l5-10h7l4 10M19 22h-3M26 22l2-4h3" fill="none" stroke="var(--p)" stroke-width="2" stroke-linecap="round"/>
    <rect x="22" y="14" width="8" height="6" rx="1" fill="var(--g)"/>` },
  // ski_trip — mountain + lift
  { key:'ski_trip', bg:'g', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--g)"/>
    <path d="M6 34l10-14 6 8 4-5 8 11z" fill="var(--p)"/>
    <path d="M14 27l2-3 2 3M28 28l2-3 2 3" fill="var(--i)"/>
    <path d="M10 14l28 6" stroke="var(--i)" stroke-width="1.5"/>
    <rect x="20" y="14" width="3" height="3" fill="var(--t)"/>
    <rect x="30" y="16" width="3" height="3" fill="var(--t)"/>` },
  // surf_trip — wave
  { key:'surf_trip', bg:'t', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--t)"/>
    <path d="M6 32c4 0 6-2 10-6s10-10 16-10c2 0 4 1 4 4 0 6-5 10-10 10-3 0-5-2-8-2-4 0-6 4-12 4z" fill="var(--p)"/>
    <path d="M26 24l-2-8c-1 0-2 2-3 5" fill="var(--g)"/>` },
  // festival_trip — stage + crowd
  { key:'festival_trip', bg:'i', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--i)"/>
    <path d="M10 22l4-8h20l4 8z" fill="var(--t)"/>
    <path d="M14 22h20v6H14z" fill="var(--g)"/>
    <circle cx="14" cy="33" r="2" fill="var(--p)"/>
    <circle cx="20" cy="34" r="2" fill="var(--p)"/>
    <circle cx="26" cy="33" r="2" fill="var(--p)"/>
    <circle cx="32" cy="34" r="2" fill="var(--p)"/>
    <path d="M14 35v3M20 36v2M26 35v3M32 36v2" stroke="var(--p)" stroke-width="2" stroke-linecap="round"/>` },
  // volunteer — hand + heart
  { key:'volunteer', bg:'t', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--t)"/>
    <path d="M24 28c-3-2-7-5-7-9a3 3 0 0 1 7-2 3 3 0 0 1 7 2c0 4-4 7-7 9z" fill="var(--p)"/>
    <path d="M14 36c0-4 4-6 10-6s10 2 10 6" fill="var(--g)"/>` },
  // photography_tour — camera + mountains
  { key:'photography_tour', bg:'f', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--f)"/>
    <rect x="9" y="18" width="30" height="18" rx="2" fill="var(--p)"/>
    <path d="M15 18l2-3h6l2 3" fill="var(--p)"/>
    <circle cx="24" cy="27" r="6" fill="var(--i)"/>
    <circle cx="24" cy="27" r="3" fill="var(--g)"/>` },
  // foodie_tour — fork + pin
  { key:'foodie_tour', bg:'g', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--g)"/>
    <path d="M16 10v10a2 2 0 0 0 2 2v16M14 10v8M18 10v8M22 10v8" fill="none" stroke="var(--i)" stroke-width="2" stroke-linecap="round"/>
    <path d="M32 38s6-7 6-12a6 6 0 0 0-12 0c0 5 6 12 6 12z" fill="var(--t)"/>
    <circle cx="32" cy="26" r="2.2" fill="var(--p)"/>` },
  // budget — coins + check
  { key:'budget', bg:'f', svg:`
    <circle cx="24" cy="24" r="22" fill="var(--f)"/>
    <ellipse cx="19" cy="20" rx="9" ry="3" fill="var(--g)"/>
    <path d="M10 20v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" fill="var(--g)"/>
    <path d="M10 20v6c0 1.7 4 3 9 3s9-1.3 9-3v-6M10 26c0 1.7 4 3 9 3s9-1.3 9-3" fill="none" stroke="var(--i)" stroke-width="1.2"/>
    <circle cx="33" cy="30" r="6" fill="var(--p)"/>
    <path d="M30 30l2 2 4-4" fill="none" stroke="var(--f)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` },
];

// ─── 5 · Event Stickers (64x64 illustrated) ──────────────────────
// 3-color max per sticker, brand palette.
const STICKERS = [
  { key:'sunrise', label:'Sunrise moment', svg:`
    <rect width="64" height="64" rx="14" fill="var(--g)"/>
    <circle cx="32" cy="40" r="11" fill="var(--t)"/>
    <path d="M8 40h48" stroke="var(--i)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M32 18v6M20 22l3 4M44 22l-3 4M14 32l5 2M50 32l-5 2" stroke="var(--i)" stroke-width="2.5" stroke-linecap="round"/>` },
  { key:'highlight', label:'Trip highlight', svg:`
    <rect width="64" height="64" rx="14" fill="var(--t)"/>
    <path d="M22 14h20v12a10 10 0 0 1-20 0z" fill="var(--g)"/>
    <path d="M22 16h-4a3 3 0 0 0 3 6M42 16h4a3 3 0 0 1-3 6" fill="none" stroke="var(--p)" stroke-width="2.2"/>
    <path d="M27 36l-2 8h14l-2-8M22 48h20" stroke="var(--p)" stroke-width="2.5" fill="var(--p)" stroke-linejoin="round"/>` },
  { key:'surprise', label:'Surprise!', svg:`
    <rect width="64" height="64" rx="14" fill="var(--g)"/>
    <path d="M32 12L36 36H28zM32 44a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="var(--t)"/>
    <path d="M16 16l4 4M48 16l-4 4M14 32h4M46 32h4" stroke="var(--i)" stroke-width="2.5" stroke-linecap="round"/>` },
  { key:'funny', label:'Funny story', svg:`
    <rect width="64" height="64" rx="14" fill="var(--g)"/>
    <circle cx="32" cy="32" r="20" fill="var(--p)"/>
    <path d="M22 28c-1-3 2-5 4-3M42 28c-1-3-6-3-7 0" fill="none" stroke="var(--i)" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 36c0 8 6 14 14 14s14-6 14-14z" fill="var(--t)"/>
    <path d="M18 36h28" stroke="var(--i)" stroke-width="2.5"/>` },
  { key:'best_meal', label:'Best meal', svg:`
    <rect width="64" height="64" rx="14" fill="var(--t)"/>
    <ellipse cx="32" cy="38" rx="20" ry="6" fill="var(--p)"/>
    <ellipse cx="32" cy="36" rx="20" ry="4" fill="var(--g)"/>
    <path d="M32 14l3 8h8l-6.5 5 2.5 8-7-5-7 5 2.5-8L21 22h8z" fill="var(--p)"/>` },
  { key:'worst_sleep', label:'Worst sleep', svg:`
    <rect width="64" height="64" rx="14" fill="var(--i)"/>
    <path d="M22 24h6l-6 8h6M34 24h6l-6 8h6M22 38h20" fill="none" stroke="var(--p)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 48c4-3 8-3 10-3s6 0 10 3" fill="none" stroke="var(--t)" stroke-width="3" stroke-linecap="round"/>` },
  { key:'weather_bad', label:'Weather ruined it', svg:`
    <rect width="64" height="64" rx="14" fill="var(--p)"/>
    <path d="M16 28a8 8 0 0 1 16-2 6 6 0 0 1 6 1 6 6 0 0 1 6 9H18a6 6 0 0 1-2-8z" fill="var(--i)"/>
    <path d="M22 42l-3 8M30 42l-3 8M38 42l-3 8M46 42l-3 8" stroke="var(--t)" stroke-width="3" stroke-linecap="round"/>` },
  { key:'expensive', label:'Most expensive', svg:`
    <rect width="64" height="64" rx="14" fill="var(--f)"/>
    <path d="M22 22c-2-3 0-8 4-8h12c4 0 6 5 4 8l-2 3c8 6 8 22-8 22s-16-16-8-22z" fill="var(--g)"/>
    <path d="M28 30v10M36 30v10M28 33h8M28 37h8" stroke="var(--i)" stroke-width="2.5" stroke-linecap="round"/>` },
  { key:'local', label:'Local connection', svg:`
    <rect width="64" height="64" rx="14" fill="var(--f)"/>
    <path d="M14 36l8-4 6 4 8-4 6 4 8-4" fill="none" stroke="var(--p)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 36l4 6 4-4 4 6 4-4 4 6 4-4" fill="none" stroke="var(--g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="22" cy="20" r="4" fill="var(--p)"/>
    <circle cx="42" cy="20" r="4" fill="var(--g)"/>` },
  { key:'bucket_list', label:'Bucket list done', svg:`
    <rect width="64" height="64" rx="14" fill="var(--t)"/>
    <rect x="16" y="16" width="32" height="32" rx="4" fill="none" stroke="var(--p)" stroke-width="3"/>
    <path d="M22 32l6 6 14-14" fill="none" stroke="var(--g)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` },
  { key:'photo_spot', label:'Best photo spot', svg:`
    <rect width="64" height="64" rx="14" fill="var(--i)"/>
    <rect x="10" y="22" width="44" height="28" rx="3" fill="var(--p)"/>
    <path d="M22 22l3-5h14l3 5" fill="var(--p)"/>
    <circle cx="32" cy="36" r="10" fill="var(--g)"/>
    <circle cx="32" cy="36" r="5" fill="var(--t)"/>` },
  { key:'emergency', label:'Emergency', svg:`
    <rect width="64" height="64" rx="14" fill="var(--p)"/>
    <path d="M32 10L58 52H6z" fill="var(--t)"/>
    <path d="M32 26v12M32 42a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="var(--p)"/>` },
  { key:'repeat', label:'Would repeat', svg:`
    <rect width="64" height="64" rx="14" fill="var(--g)"/>
    <path d="M14 32a18 18 0 0 1 30-13l4-4v12h-12l4-4a12 12 0 0 0-20 9z" fill="var(--f)"/>
    <path d="M50 32a18 18 0 0 1-30 13l-4 4v-12h12l-4 4a12 12 0 0 0 20-9z" fill="var(--t)"/>` },
  { key:'skip', label:'Skip next time', svg:`
    <rect width="64" height="64" rx="14" fill="var(--p)"/>
    <circle cx="32" cy="32" r="20" fill="var(--t)"/>
    <path d="M22 22l20 20M42 22L22 42" stroke="var(--p)" stroke-width="5" stroke-linecap="round"/>` },
];

// expose
window.TRIPPY_ICONS = { UI_ICONS, EVENT_GROUPS, SUPPLY_ICONS, TRIP_TYPES, STICKERS };
