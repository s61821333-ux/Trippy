'use client';

import { createClient } from '@/utils/supabase/client';

interface Props {
  compact?: boolean;
  locale?: 'en' | 'he';
}

export default function LandingSignIn({ compact = false, locale = 'en' }: Props) {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (compact) {
    return (
      <button
        onClick={handleSignIn}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          background: 'var(--terra)',
          color: 'oklch(98% 0.002 80)',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          cursor: 'pointer',
          transition: 'background 0.15s, transform 0.1s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--terra-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--terra)')}
      >
        {locale === 'he' ? 'כניסה' : 'Sign in'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '15px 32px',
        background: 'var(--text)',
        color: 'oklch(98% 0.002 80)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: '-0.015em',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-lg)',
        transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
    >
      <GoogleIcon />
      {locale === 'he' ? 'כניסה עם Google' : 'Sign in with Google'}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
