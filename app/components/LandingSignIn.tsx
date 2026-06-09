'use client';

import { useEffect, useState } from 'react';
import { signInWithGoogle, signInWithPasskey } from '@/lib/db';

interface Props {
  compact?: boolean;
  locale?: 'en' | 'he';
}

export default function LandingSignIn({ compact = false, locale = 'en' }: Props) {
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPasskeySupported(
      typeof window !== 'undefined' && !!window.PublicKeyCredential,
    );
  }, []);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setGoogleLoading(false);
      setError(locale === 'he' ? 'שגיאה בכניסה עם Google' : 'Google sign-in failed');
    }
  };

  const handlePasskey = async () => {
    setPasskeyLoading(true);
    setError('');
    try {
      await signInWithPasskey();
      window.location.href = '/app';
    } catch (e: unknown) {
      setPasskeyLoading(false);
      const msg = e instanceof Error ? e.message : '';
      // User cancelled the browser prompt — don't show an error
      if (msg.includes('cancel') || msg.includes('abort') || msg.includes('NotAllowed')) return;
      setError(locale === 'he' ? 'כניסה עם Passkey נכשלה' : 'Passkey sign-in failed — make sure you have one registered');
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
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
          cursor: googleLoading ? 'wait' : 'pointer',
          opacity: googleLoading ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {locale === 'he' ? 'כניסה' : 'Sign in'}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: 340 }}>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || passkeyLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '14px 24px',
          background: 'var(--text)',
          color: 'oklch(98% 0.002 80)',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '-0.015em',
          cursor: (googleLoading || passkeyLoading) ? 'not-allowed' : 'pointer',
          opacity: (passkeyLoading) ? 0.45 : googleLoading ? 0.7 : 1,
          boxShadow: 'var(--shadow-lg)',
          transition: 'opacity 0.15s',
        }}
      >
        {googleLoading ? (
          <Spinner />
        ) : (
          <GoogleIcon />
        )}
        {locale === 'he' ? 'כניסה עם Google' : 'Continue with Google'}
      </button>

      {/* Passkey — only rendered when the browser supports WebAuthn */}
      {passkeySupported && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
              {locale === 'he' ? 'או' : 'or'}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            onClick={handlePasskey}
            disabled={googleLoading || passkeyLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '13px 24px',
              background: 'transparent',
              color: 'var(--text)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.015em',
              cursor: (googleLoading || passkeyLoading) ? 'not-allowed' : 'pointer',
              opacity: (googleLoading) ? 0.45 : passkeyLoading ? 0.7 : 1,
              transition: 'opacity 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { if (!googleLoading && !passkeyLoading) e.currentTarget.style.borderColor = 'var(--text-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {passkeyLoading ? <Spinner dark /> : <PasskeyIcon />}
            {locale === 'he' ? 'כניסה עם Passkey' : 'Sign in with Passkey'}
          </button>
        </>
      )}

      {error && (
        <p style={{
          fontSize: 13,
          color: 'var(--danger, #e53e3e)',
          textAlign: 'center',
          margin: '4px 0 0',
          lineHeight: 1.4,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function PasskeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="3.5" />
      <path d="M3 21v-1a5 5 0 0 1 5-5h.5" />
      <path d="M15 12l1.5 1.5L19 11" />
      <rect x="13" y="9" width="8" height="6" rx="1.5" />
    </svg>
  );
}

function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={dark ? 'var(--text-3)' : 'rgba(255,255,255,0.3)'} strokeWidth="2.5" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke={dark ? 'var(--text)' : 'white'} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
