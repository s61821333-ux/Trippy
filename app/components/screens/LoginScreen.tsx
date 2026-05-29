'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { blurUpVariants, staggerContainer } from '@/lib/motion';
import GlassBtn from '../ui/GlassBtn';
import Field from '../ui/Field';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import CompassMark from '../ui/CompassMark';
import CompassLoader from '../ui/CompassLoader';
import CountriesInput from '../ui/CountriesInput';
import { StampIcon } from '../ui/StampIcon';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';
import { TripTheme } from '@/lib/types';
import { dbGetUserTrips } from '@/lib/db';
import { CURRENCIES } from '@/lib/currency';

// ─── Particle canvas ──────────────────────────────────────────────────────────
function AtmosphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface Particle { x: number; y: number; size: number; speedY: number; opacity: number; }
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const spawn = (): Particle => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      size:    Math.random() * 2 + 0.5,
      speedY:  Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.45 + 0.05,
    });
    for (let i = 0; i < 60; i++) particles.push(spawn());

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.speedY;
        if (p.y < -10) { Object.assign(p, spawn()); p.y = canvas.height + 10; }
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const card = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 300, damping: 28 },
  }),
};

const THEMES: { id: TripTheme; stampKey: string; label: string; labelHe: string; bg: string; accent: string }[] = [
  { id: 'desert', stampKey: 'cactus',    label: 'Desert', labelHe: 'מדבר', bg: '#FFF4EC', accent: '#C4714A' },
  { id: 'nature', stampKey: 'pine_tree', label: 'Nature', labelHe: 'טבע',  bg: '#EDF5EF', accent: '#3B6E52' },
  { id: 'city',   stampKey: 'museum',    label: 'City',   labelHe: 'עיר',  bg: '#F0F0F4', accent: '#3A2E26' },
  { id: 'beach',  stampKey: 'beach',     label: 'Beach',  labelHe: 'חוף',  bg: '#E8F7F9', accent: '#2B7A8E' },
];

function isInWebView() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/FBAN|FBAV|FB_IAB|Instagram|Twitter\/|Line\/|WhatsApp|Snapchat/i.test(ua)) return true;
  if (/Android/.test(ua) && /wv/.test(ua)) return true;
  if (/iPhone|iPad/.test(ua) && !/Safari\//.test(ua) && /AppleWebKit/.test(ua)) return true;
  return false;
}

// ─── Step 1: Auth ─────────────────────────────────────────────────────────────
function AuthStep() {
  const { signInWithGoogle } = useAppStore();
  const { t } = useI18n();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [webView] = useState(() => isInWebView());
  const cardRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on mousemove
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xAxis = ((rect.left + rect.width / 2) - e.clientX) / 40;
    const yAxis = ((rect.top  + rect.height / 2) - e.clientY) / 40;
    el.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateY(-4px)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = '';
  }, []);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Cinematic warm background ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(162deg, #EDB87A 0%, #D9925A 22%, #C07248 45%, #8A5038 68%, #5A3025 100%)',
      }} />

      {/* Warm ambient orbs */}
      <div style={{ position: 'absolute', top: '-8%', right: '-12%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,150,0.55) 0%, transparent 70%)', filter: 'blur(48px)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-12%', left: '-16%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(160,100,60,0.48) 0%, transparent 70%)', filter: 'blur(64px)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '28%', left: '8%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,235,190,0.28) 0%, transparent 70%)', filter: 'blur(32px)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,110,82,0.22) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 1, pointerEvents: 'none' }} />

      {/* Sparkle particles */}
      <AtmosphereCanvas />

      {/* ── Main glass card ── */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 48, scale: 0.93, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.25, 0, 0, 1], delay: 0.08 }}
        style={{
          position: 'relative', zIndex: 10,
          width: 'calc(100% - 48px)',
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.84)',
          backdropFilter: 'blur(48px) saturate(2.0)',
          WebkitBackdropFilter: 'blur(48px) saturate(2.0)',
          borderRadius: 48,
          padding: '52px 40px 48px',
          boxShadow: [
            '0 48px 96px rgba(26,20,16,0.26)',
            '0 12px 40px rgba(26,20,16,0.14)',
            'inset 0 2px 0 rgba(255,255,255,0.92)',
            'inset 0 -1px 0 rgba(26,20,16,0.04)',
          ].join(', '),
          border: '1px solid rgba(255,255,255,0.88)',
          textAlign: 'center',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Specular diagonal shine */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.48) 0%, transparent 55%, rgba(255,255,255,0.08) 100%)', pointerEvents: 'none', borderRadius: 'inherit', zIndex: 0 }} />

        {/* Globe Loader / Compass hero */}
        <motion.div
          initial={{ scale: 0.55, opacity: 0, filter: 'blur(8px)' }}
          animate={{ scale: 1,    opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.20 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, position: 'relative', zIndex: 1 }}
        >
          {googleLoading
            ? <CompassLoader size={88} />
            : (
              <div style={{ animation: 'float 6s ease-in-out infinite' }}>
                <CompassMark size={88} />
              </div>
            )
          }
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ delay: 0.30, duration: 0.45, ease: [0.25, 0, 0, 1] }}
          style={{ marginBottom: 14, position: 'relative', zIndex: 1 }}
        >
          <h1 dir="ltr" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3.2rem, 12vw, 4.8rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.03em',
            color: 'var(--forest-dk)',
            lineHeight: 0.95,
          }}>
            Trippy<span style={{ color: 'var(--terra)', fontStyle: 'normal' }}>.</span>
          </h1>
        </motion.div>

        {/* Editorial tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ delay: 0.38, duration: 0.45, ease: [0.25, 0, 0, 1] }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.2rem, 4.5vw, 1.55rem)',
            fontStyle: 'italic',
            color: 'var(--ink-soft)',
            lineHeight: 1.4,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            marginBottom: 12,
            position: 'relative', zIndex: 1,
          }}
        >
          {t('appTagline')}
        </motion.p>

        {/* Body copy */}
        <motion.p
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ delay: 0.44, duration: 0.42, ease: [0.25, 0, 0, 1] }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--text-2)',
            lineHeight: 1.65,
            marginBottom: 32,
            maxWidth: 320,
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'relative', zIndex: 1,
          }}
        >
          Experience the new standard in collaborative travel. From desert dunes to city lights, your journey begins here.
        </motion.p>

        {webView && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.50 }}
            style={{
              marginBottom: 16, padding: '12px 14px',
              background: 'rgba(255,180,0,0.10)', border: '1px solid rgba(255,180,0,0.35)',
              borderRadius: 16, fontSize: 13, lineHeight: 1.5, color: 'var(--text)',
              textAlign: 'left', position: 'relative', zIndex: 1,
            }}
          >
            <span style={{ fontWeight: 700 }}>⚠️ </span>{t('webViewWarning')}
          </motion.div>
        )}

        {/* CTA — morphic primary pill */}
        <motion.button
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ delay: 0.50, duration: 0.45, ease: [0.25, 0, 0, 1] }}
          onClick={handleGoogle}
          disabled={googleLoading}
          whileHover={{ scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
          whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
          className="specular-hover btn-morphic"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '18px 28px', minHeight: 62,
            background: 'linear-gradient(135deg, var(--brand) 0%, var(--primary-container) 100%)',
            border: 'none',
            borderRadius: 9999,
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: googleLoading ? 'wait' : 'pointer',
            opacity: googleLoading ? 0.75 : 1,
            boxShadow: '0 10px 32px rgba(34,85,59,0.42), inset 0 1px 0 rgba(255,255,255,0.18)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            position: 'relative', zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Shine sweep on hover */}
          <span style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          <span style={{ position: 'relative' }}>
            {googleLoading ? t('signingIn') || 'Signing in…' : t('startAdventure') || 'Start an Adventure'}
          </span>
          {!googleLoading && (
            <span style={{ fontSize: 20, lineHeight: 1, position: 'relative' }}>→</span>
          )}
        </motion.button>
      </motion.div>

      {/* ── Footer tagline ── */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
        transition={{ delay: 0.68, duration: 0.45, ease: [0.25, 0, 0, 1] }}
        style={{
          position: 'relative', zIndex: 10,
          marginTop: 28,
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 9, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.52)',
        }}
      >
        <span>Collaborate</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.38)', flexShrink: 0 }} />
        <span>Discover</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.38)', flexShrink: 0 }} />
        <span>Document</span>
      </motion.div>
    </div>
  );
}

// ─── Trip card component ───────────────────────────────────────────────────────
type UserTrip = { id: string; name: string; theme: string | null; days: number; start_date: string | null };

const THEME_META: Record<string, { bg: string; stripe: string; emoji: string }> = {
  desert:   { bg: 'linear-gradient(135deg, #FFF4EC 0%, #FFE5D0 100%)', stripe: '#C4714A', emoji: '🏜️' },
  nature:   { bg: 'linear-gradient(135deg, #EDF5EF 0%, #D8ECD8 100%)', stripe: '#3B6E52', emoji: '🌲' },
  city:     { bg: 'linear-gradient(135deg, #F0F0F4 0%, #DFE0E8 100%)', stripe: '#3A2E26', emoji: '🌆' },
  beach:    { bg: 'linear-gradient(135deg, #E8F7F9 0%, #D0EEF2 100%)', stripe: '#2B7A8E', emoji: '🏖️' },
  mountain: { bg: 'linear-gradient(135deg, #EEF2F8 0%, #DCE4F0 100%)', stripe: '#3C5A80', emoji: '⛰️' },
  snow:     { bg: 'linear-gradient(135deg, #F0F6FF 0%, #DCE8F8 100%)', stripe: '#4070A0', emoji: '❄️' },
};

function getTripMeta(theme: string | null) {
  return THEME_META[theme ?? ''] ?? THEME_META.desert;
}

// ─── Step 2: Trip (homepage) ──────────────────────────────────────────────────
function TripStep() {
  const { loadTripById, createTrip, authUser, logout, pendingInvitations, loadInvitations, acceptInvitation, rejectInvitation, loadDemoTrip } = useAppStore();
  const { show } = useToast();
  const { t, locale } = useI18n();

  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [loadingTripId, setLoadingTripId] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) return;
    setTripsLoading(true);
    dbGetUserTrips(authUser.id)
      .then(trips => setUserTrips(trips))
      .catch(() => {})
      .finally(() => setTripsLoading(false));
    loadInvitations();
  }, [authUser?.id]);

  const [cName,     setCName]     = useState('');
  const [cNick,     setCNick]     = useState(authUser?.username ?? '');
  const [cTheme,    setCTheme]    = useState<TripTheme>('desert');
  const [cDate,     setCDate]     = useState(new Date().toISOString().split('T')[0]);
  const [cEndDate,  setCEndDate]  = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  });
  const [cCountries, setCCountries] = useState<string[]>([]);
  const [cCurrency,  setCCurrency]  = useState('USD');

  const calcDays = (start: string, end: string) =>
    Math.max(1, Math.min(90, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1));

  const handleCreate = async () => {
    if (!cName.trim()) { show(t('enterTripName')); return; }
    if (!cNick.trim()) { show(t('enterNickname')); return; }
    if (cEndDate < cDate) { show(locale === 'he' ? 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה' : 'End date must be after start date'); return; }
    setLoading(true);
    try {
      await createTrip(cName, calcDays(cDate, cEndDate), cNick, cTheme, cDate, cCountries, cCurrency);
    } catch (err: any) {
      const msg = (err?.message ?? '').toLowerCase();
      if (msg.includes('not authenticated')) {
        show(locale === 'he' ? 'לא מחובר — נסה להתנתק ולהתחבר מחדש' : 'Not signed in — please sign out and sign in again');
      } else if (msg.includes('row-level security') || msg.includes('violates') || msg.includes('rls')) {
        show(locale === 'he' ? 'שגיאת הרשאות Supabase' : 'Supabase RLS error — run the INSERT policy in your dashboard');
      } else {
        show(`${t('createTripFailed')}: ${err?.message ?? ''}`);
      }
    }
    setLoading(false);
  };

  const handleAccept = async (id: string) => {
    setActionId(id);
    try { await acceptInvitation(id); }
    catch (err: any) {
      show(err?.message === 'not_found' || err?.message === 'Invitation not found'
        ? t('tripNotFound')
        : locale === 'he' ? '⚠️ שגיאה בקבלת ההזמנה' : '⚠️ Could not accept invitation');
    }
    setActionId(null);
  };
  const handleReject = async (id: string) => { setActionId(id); await rejectInvitation(id); setActionId(null); };

  const selectedTheme = THEMES.find(th => th.id === cTheme) ?? THEMES[0];

  // User avatar initials
  const initials = (authUser?.username ?? '?')[0].toUpperCase();

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: 'var(--bg)',
      WebkitOverflowScrolling: 'touch' as any,
    }}>
      {/* ── Top hero strip ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(158deg, #2A5040 0%, #1E1810 50%, #5C2918 100%)',
        paddingTop: 'calc(env(safe-area-inset-top, 16px) + 20px)',
        paddingBottom: 36,
        paddingLeft: 24, paddingRight: 24,
        overflow: 'hidden',
        borderRadius: '0 0 40px 40px',
        boxShadow: '0 20px 56px rgba(26,20,16,0.20)',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,148,74,0.30) 0%, transparent 70%)', filter: 'blur(48px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,110,82,0.25) 0%, transparent 70%)', filter: 'blur(56px)', pointerEvents: 'none' }} />

        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, position: 'relative', zIndex: 1 }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CompassMark size={26} style={{ '--compass-ring': '#F4EFE8', '--compass-n': '#E0916B', '--compass-s': '#8BB39A', '--compass-ew': '#E6B574', '--compass-hub': '#F4EFE8' } as React.CSSProperties} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)', lineHeight: 1 }}>
              Trippy<span style={{ color: '#E0916B' }}>.</span>
            </span>
          </div>
          {/* User avatar + sign-out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.90)' }}>
              {initials}
            </div>
            <button
              onClick={logout}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              {t('signOut')}
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>
            {t('hi')}, {authUser?.username} 👋
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.9rem, 7vw, 2.8rem)', fontWeight: 700, color: 'rgba(255,255,255,0.94)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 4 }}>
            Where to next?
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.50)', fontWeight: 400 }}>
            Your adventures are waiting.
          </p>
        </div>
      </div>

      <div style={{ padding: '0 20px', maxWidth: 500, margin: '0 auto' }}>

        {/* ── Primary CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ delay: 0.08, duration: 0.42, ease: [0.25, 0, 0, 1] }}
          style={{ marginTop: 20, marginBottom: 12 }}
        >
          <motion.button
            onClick={() => setShowCreate(true)}
            whileHover={{ scale: 1.012, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 22 } }}
            className="specular-hover btn-morphic"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '16px 22px', minHeight: 58,
              background: 'linear-gradient(135deg, var(--brand) 0%, var(--primary-container) 100%)',
              border: 'none', borderRadius: 9999,
              color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
              fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(34,85,59,0.36), inset 0 1px 0 rgba(255,255,255,0.16)',
              WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
              overflow: 'hidden', position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="plus" size={16} />
              <span>{t('createNewTrip')}</span>
            </div>
            <span style={{ fontSize: 18, lineHeight: 1, opacity: 0.85 }}>→</span>
          </motion.button>
        </motion.div>

        {/* Demo */}
        <motion.div
          initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ delay: 0.14, duration: 0.40, ease: [0.25, 0, 0, 1] }}
          style={{ marginBottom: 28 }}
        >
          <motion.button
            onClick={loadDemoTrip}
            whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 22 } }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px 22px', minHeight: 48,
              background: 'rgba(255,255,255,0.76)', border: '1px solid rgba(255,255,255,0.92)',
              backdropFilter: 'blur(24px) saturate(1.6)', WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
              borderRadius: 9999, color: 'var(--text-2)',
              fontFamily: 'var(--font-mono)', fontSize: 11,
              fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70), 0 2px 10px rgba(26,20,16,0.06)',
              WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
            }}
          >
            ✨ {t('tryDemo')}
          </motion.button>
        </motion.div>

        {/* ── Pending invitations ── */}
        <AnimatePresence>
          {pendingInvitations.length > 0 && (
            <motion.div
              key="invites"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{ marginBottom: 20 }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 10 }}>
                {t('invitations')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingInvitations.map(inv => {
                  const meta = getTripMeta(inv.tripTheme);
                  return (
                    <div key={inv.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', borderRadius: 22,
                      background: 'rgba(255,255,255,0.80)',
                      backdropFilter: 'blur(40px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                      border: '1px solid rgba(255,255,255,0.90)',
                      boxShadow: '0 4px 16px rgba(26,20,16,0.07)',
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 16, flexShrink: 0,
                        background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, border: `1.5px solid ${meta.stripe}22`,
                      }}>
                        {meta.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{inv.tripName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, fontWeight: 500 }}>{t('invitedToJoin')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <GlassBtn variant="accent" size="sm" onClick={() => handleAccept(inv.id)} disabled={actionId !== null} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 9999 }}>
                          {actionId === inv.id ? '…' : t('acceptBtn')}
                        </GlassBtn>
                        <GlassBtn size="sm" onClick={() => handleReject(inv.id)} disabled={actionId !== null} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 9999 }}>
                          {t('rejectBtn')}
                        </GlassBtn>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── My Trips ── */}
        {(tripsLoading || userTrips.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
            transition={{ delay: 0.20, duration: 0.45, ease: [0.25, 0, 0, 1] }}
            style={{ marginBottom: 24 }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              {t('myTrips')}
            </p>

            {tripsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <CompassLoader size={56} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {userTrips.map((trip, i) => {
                  const meta = getTripMeta(trip.theme);
                  const isLoading = loadingTripId === trip.id;
                  return (
                    <motion.button
                      key={trip.id}
                      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
                      transition={{ delay: 0.22 + i * 0.06, duration: 0.42, ease: [0.25, 0, 0, 1] }}
                      whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 22 } }}
                      onClick={async () => {
                        setLoadingTripId(trip.id);
                        try { await loadTripById(trip.id); }
                        catch { show(t('tripNotFound')); }
                        finally { setLoadingTripId(null); }
                      }}
                      disabled={loadingTripId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: 24,
                        background: 'rgba(255,255,255,0.82)',
                        backdropFilter: 'blur(40px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                        border: '1px solid rgba(255,255,255,0.92)',
                        boxShadow: '0 4px 16px rgba(26,20,16,0.07)',
                        cursor: loadingTripId && !isLoading ? 'default' : 'pointer',
                        width: '100%', textAlign: locale === 'he' ? 'right' : 'left',
                        opacity: loadingTripId && !isLoading ? 0.48 : 1,
                        transition: 'opacity 0.18s',
                        WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
                      }}
                    >
                      {/* Theme thumbnail */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                        background: meta.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26,
                        border: `1.5px solid ${meta.stripe}20`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.60)`,
                      }}>
                        {meta.emoji}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                          {trip.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
                            {trip.days} {t('days')}
                          </span>
                          {trip.start_date && (
                            <>
                              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-strong)', flexShrink: 0 }} />
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>{trip.start_date}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Arrow / loader */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: isLoading ? 'transparent' : meta.stripe,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isLoading ? 'none' : `0 4px 12px ${meta.stripe}40`,
                      }}>
                        {isLoading
                          ? <CompassLoader size={28} />
                          : <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>→</span>
                        }
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Spacer for safe area */}
        <div style={{ height: 'max(32px, env(safe-area-inset-bottom, 32px))' }} />
      </div>

      {/* ── Create Trip Sheet ── */}
      {showCreate && (
        <Sheet
          onClose={() => setShowCreate(false)}
          title={t('createNewTrip')}
          subtitle={locale === 'he' ? selectedTheme.labelHe : selectedTheme.label}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Theme picker — visual 2×2 grid */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.10em', fontFamily: 'var(--font-mono)' }}>
                {t('backgroundLabel')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {THEMES.map(th => (
                  <motion.button
                    key={th.id}
                    whileTap={{ scale: 0.94, transition: { type: 'spring', stiffness: 500, damping: 22 } }}
                    onClick={() => setCTheme(th.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '18px 10px', borderRadius: 28, cursor: 'pointer',
                      background: cTheme === th.id ? th.bg : 'var(--bg)',
                      border: cTheme === th.id ? `2px solid ${th.accent}` : '1.5px solid var(--border)',
                      boxShadow: cTheme === th.id ? `0 4px 18px ${th.accent}30, inset 0 1px 0 rgba(255,255,255,0.60)` : 'none',
                      transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <StampIcon iconKey={th.stampKey} size={52} />
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: cTheme === th.id ? th.accent : 'var(--text-2)',
                      transition: 'color 0.15s',
                    }}>
                      {locale === 'he' ? th.labelHe : th.label}
                    </span>
                    {cTheme === th.id && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: th.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={11} style={{ color: '#fff' }} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <Field label={t('tripName')} placeholder={t('createPlaceholderName')} value={cName} onChange={setCName} icon={<Icon name="tent" size={15} />} />
            <Field label={t('yourNickname')} placeholder={t('createPlaceholderNick')} value={cNick} onChange={setCNick} icon={<Icon name="user" size={15} />} />
            <CountriesInput label={t('countriesLabel')} value={cCountries} onChange={setCCountries} />

            {/* Currency */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{t('currencyLabel')}</label>
              <select
                value={cCurrency} onChange={e => setCCurrency(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 500, minHeight: 44, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-sans)' }}
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {locale === 'he' ? c.labelHe : c.label}</option>)}
              </select>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{t('startDateLabel')}</label>
                <input type="date" value={cDate} onChange={e => setCDate(e.target.value)} className="input-premium"
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 500, minHeight: 44, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{locale === 'he' ? 'תאריך סיום' : 'End date'}</label>
                <input type="date" value={cEndDate} min={cDate} onChange={e => setCEndDate(e.target.value)} className="input-premium"
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 500, minHeight: 44, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
            </div>
            {cDate && cEndDate && cEndDate >= cDate && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, textAlign: 'center', marginTop: -8 }}>
                {calcDays(cDate, cEndDate)} {locale === 'he' ? 'ימים' : 'days'}
              </p>
            )}

            <button
              onClick={handleCreate} disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '16px 24px', minHeight: 54,
                background: loading ? 'var(--brand-hover)' : 'var(--brand)', border: 'none', borderRadius: 9999,
                color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
                fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.78 : 1,
                marginTop: 4,
                boxShadow: '0 6px 20px rgba(34,85,59,0.30)',
                WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
              }}
            >
              {loading ? <CompassLoader size={22} /> : <Icon name="check" size={15} />}
              {loading ? '' : t('createBtn')}
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { authUser } = useAppStore();

  return (
    <AnimatePresence mode="wait">
      {authUser ? (
        <motion.div key="trip" style={{ height: '100%' }}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
          <TripStep />
        </motion.div>
      ) : (
        <motion.div key="auth" style={{ height: '100%' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}>
          <AuthStep />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
