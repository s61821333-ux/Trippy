'use client';

import React, { useState, useRef, useEffect } from 'react';
import { m } from 'framer-motion';
import { createPortal } from 'react-dom';
import Icon from '../ui/Icon';
import GlassBtn from '../ui/GlassBtn';
import { useI18n } from '@/lib/i18n';
import { mfaListFactors, mfaChallengeAndVerify } from '@/lib/db';

interface Props {
  onSuccess: () => void;
  onSignOut: () => void;
}

export default function MFAChallenge({ onSuccess, onSignOut }: Props) {
  const { locale } = useI18n();
  const isHe = locale === 'he';

  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mfaListFactors()
      .then(data => {
        const totp = data.totp?.find(f => f.status === 'verified');
        if (totp) setFactorId(totp.id);
        else onSuccess();
      })
      .catch(() => onSuccess())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) setTimeout(() => inputRef.current?.focus(), 50);
  }, [loading]);

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setVerifying(true);
    setError('');
    try {
      await mfaChallengeAndVerify(factorId, code);
      onSuccess();
    } catch {
      setError(isHe ? 'קוד שגוי - נסה שוב' : 'Wrong code - try again');
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  const content = (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(162deg, #1a1208 0%, #2a1c10 45%, #1a1208 100%)',
        padding: '0 24px',
      }}
    >
      {/* Ambient orb */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,113,74,0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <m.div
        initial={{ opacity: 0, y: 32, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: [0.25, 0, 0, 1], delay: 0.1 }}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 380,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(48px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(48px) saturate(1.8)',
          borderRadius: 28, padding: '36px 28px 32px',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.52)',
        }}
      >
        {/* Lock icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 18, marginBottom: 20,
          background: 'rgba(196,113,74,0.18)',
          border: '1px solid rgba(196,113,74,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="lock" size={24} color="var(--lg-terra-bright, #E89260)" />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700,
          color: 'var(--text-inv)', margin: '0 0 6px', letterSpacing: '-0.02em',
        }}>
          {isHe ? 'אמת את זהותך' : 'Verify your identity'}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 28px', lineHeight: 1.5 }}>
          {isHe ? 'הזן את הקוד בן 6 הספרות מאפליקציית האימות שלך.' : 'Enter the 6-digit code from your authenticator app.'}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '20px 0' }}>
            {isHe ? 'טוען…' : 'Loading…'}
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={e => {
                setError('');
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleVerify(); }}
              placeholder="000000"
              style={{
                width: '100%', height: 60, fontSize: 30,
                fontFamily: 'var(--font-mono)', fontWeight: 700,
                letterSpacing: '0.32em', textAlign: 'center',
                background: 'rgba(255,255,255,0.07)',
                border: error
                  ? '1.5px solid rgba(239,68,68,0.6)'
                  : '1.5px solid rgba(255,255,255,0.14)',
                borderRadius: 16, color: 'var(--text-inv)',
                outline: 'none', marginBottom: 8,
                caretColor: 'var(--lg-terra-bright, #E89260)',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              autoComplete="one-time-code"
            />

            {error && (
              <m.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 12.5, color: 'rgba(239,68,68,0.85)', margin: '0 0 16px', textAlign: 'center' }}
              >
                {error}
              </m.p>
            )}

            <GlassBtn
              variant="accent"
              size="lg"
              onClick={handleVerify}
              disabled={code.length !== 6 || verifying}
              style={{
                width: '100%', marginTop: error ? 0 : 16,
                opacity: (code.length !== 6 || verifying) ? 0.45 : 1,
              }}
            >
              {verifying ? (isHe ? 'מאמת…' : 'Verifying…') : (isHe ? 'אמת' : 'Verify')}
            </GlassBtn>
          </>
        )}

        {/* Sign out link */}
        <button
          onClick={onSignOut}
          style={{
            marginTop: 22, width: '100%',
            background: 'none', border: 0, cursor: 'pointer',
            fontSize: 13, color: 'rgba(255,255,255,0.35)',
            textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.15)',
          }}
        >
          {isHe ? 'התנתק ונסה שוב' : 'Sign out and try again'}
        </button>
      </m.div>
    </m.div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
}

