/* ════════════════════════════════════════════════════════════
 *  Trippy — Line Icon Set  (primary in-app iconography)
 *  24×24 viewBox · stroke 1.5 · round caps + joins · fill:none
 *  Mirror of app/components/ui/Icon.tsx from the Trippy codebase.
 *
 *  Usage (vanilla):
 *    el.innerHTML = TrippyIcon('compass', { size: 24, color: 'var(--brand)' });
 *  Usage (just the paths):
 *    TRIPPY_ICON_PATHS['map']  →  '<path .../>'
 * ════════════════════════════════════════════════════════════ */
(function () {
  const PATHS = {
    home:      `<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6h-6v6H4.5a1 1 0 0 1-1-1z"/>`,
    calendar:  `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>`,
    checklist: `<path d="M4 6.5l1.6 1.6L8.8 5M13 6.5h7M4 12.5l1.6 1.6L8.8 11M13 12.5h7M4 18.5l1.6 1.6L8.8 17M13 18.5h6"/>`,
    settings:  `<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H4a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h.1a1.6 1.6 0 0 0 1-1.5V4a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v.1a1.6 1.6 0 0 0 1.5 1H20a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>`,
    plus:      `<path d="M12 5v14M5 12h14"/>`,
    chevR:     `<path d="M9 5l7 7-7 7"/>`,
    chevL:     `<path d="M15 5l-7 7 7 7"/>`,
    share:     `<path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/>`,
    map:       `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>`,
    sparkle:   `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
    trash:     `<path d="M4 7h16M10 11v6M14 11v6M6 7l.9 12.1A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 7M9 7V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5V7"/>`,
    edit:      `<path d="M4 20.5h4l11-11-4-4-11 11zM14.5 6l4 4M4 20.5l1-4"/>`,
    x:         `<path d="M6 6l12 12M18 6L6 18"/>`,
    check:     `<path d="M5 12l5 5L20 7"/>`,
    sun:       `<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>`,
    wind:      `<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8a3 3 0 1 0-3-3"/>`,
    lock:      `<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
    pin:       `<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>`,
    download:  `<path d="M12 4v12M8 12l4 4 4-4M5 20h14"/>`,
    compass:   `<circle cx="12" cy="12" r="9"/><path d="M15 9l-1.6 4.4L9 15l1.6-4.4z"/>`,
    tent:      `<path d="M3 20L12 4l9 16M12 4v16M9 20l3-4 3 4"/>`,
    water:     `<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/>`,
    calExport: `<rect x="3" y="5" width="13" height="15.5" rx="2"/><path d="M3 9.5h13M7 3v4M12 3v4M14 14h7M18 11l3 3-3 3"/>`,
    user:      `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    users:     `<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 21a5 5 0 0 0-8-4"/>`,
    search:    `<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>`,
    filter:    `<path d="M3 5h18l-7 8v7l-4-2v-5z"/>`,
    ai:        `<path d="M13 3L5 13h6l-2 8 10-12h-7z"/>`,
    clock:     `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
    arrow:     `<path d="M5 12h14M13 6l6 6-6 6"/>`,
    menu:      `<path d="M4 7h16M4 12h16M4 17h16"/>`,
    grid:      `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
    swap:      `<path d="M7 16V8M7 8L4 11M7 8l3 3M17 8v8M17 16l3-3M17 16l-3-3"/>`,
  };

  function TrippyIcon(name, opts) {
    opts = opts || {};
    const size = opts.size || 20;
    const stroke = opts.color || 'currentColor';
    const svg = PATHS[name] || '';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle">${svg}</svg>`;
  }

  window.TRIPPY_ICON_PATHS = PATHS;
  window.TrippyIcon = TrippyIcon;
})();
