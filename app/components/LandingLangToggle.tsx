'use client';

interface Props {
  locale: 'en' | 'he';
}

export default function LandingLangToggle({ locale }: Props) {
  const toggle = () => {
    const next = locale === 'en' ? 'he' : 'en';
    document.cookie = `Trippy-locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      aria-label={locale === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-2)',
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        padding: '5px 14px',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
        lineHeight: 1,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-2)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {locale === 'en' ? 'עב' : 'EN'}
    </button>
  );
}
