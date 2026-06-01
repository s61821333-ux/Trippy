export default function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 28,
      background: '#F4EFE8',
    }}>
      <svg width="160" height="160" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="120" cy="120" r="90" stroke="#1A1410" strokeWidth="4" fill="none" opacity="0.12"/>
        <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="#C4714A"/>
        <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="#3B6E52"/>
        <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="#C8944A" opacity="0.85"/>
        <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="#C8944A" opacity="0.85"/>
        <circle cx="120" cy="120" r="6" fill="#1A1410"/>
      </svg>
      <span style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: '#1A1410',
        lineHeight: 1,
      }}>
        Trippy<span style={{ color: '#C4714A' }}>.</span>
      </span>
    </div>
  );
}
