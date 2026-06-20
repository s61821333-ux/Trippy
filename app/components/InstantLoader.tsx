// Server-renderable instant loader (no 'use client', no hooks, no JS needed).
// Used as the route-level Suspense fallback (loading.tsx) so a returning user
// sees the Trippy brand immediately instead of a white screen while the server
// resolves auth and the client bundle downloads/hydrates.
export default function InstantLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'var(--bg)',
        zIndex: 'var(--z-top)',
      }}
    >
      <style>{`@keyframes Trippy-spin{to{transform:rotate(360deg)}}@keyframes Trippy-pulse{0%,100%{opacity:1}50%{opacity:.55}}@media (prefers-reduced-motion: reduce){.Trippy-instant-spin{animation:none!important}.Trippy-instant-word{animation:none!important}}`}</style>
      <div className="Trippy-instant-spin" style={{ width: 72, height: 72, animation: 'Trippy-spin 1.6s linear infinite' }}>
        <svg width="72" height="72" viewBox="0 0 240 240" fill="none" aria-hidden="true">
          <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--terra)" />
          <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--brand)" />
          <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--sand)" opacity="0.75" />
          <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--sand)" opacity="0.75" />
          <circle cx="120" cy="120" r="6" fill="var(--text)" />
        </svg>
      </div>
      <span
        className="Trippy-instant-word"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'var(--text)',
          lineHeight: 1,
          direction: 'ltr',
          animation: 'Trippy-pulse 1.6s ease-in-out infinite',
        }}
      >
        Trippy<span style={{ color: 'var(--terra)' }}>.</span>
      </span>
    </div>
  );
}
