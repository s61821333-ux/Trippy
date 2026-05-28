'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Field from '../ui/Field';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import CompassMark from '../ui/CompassMark';
import CountriesInput from '../ui/CountriesInput';
import { StampIcon } from '../ui/StampIcon';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';
import { TripTheme } from '@/lib/types';
import { dbGetUserTrips } from '@/lib/db';
import { CURRENCIES } from '@/lib/currency';

const card = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 300, damping: 28 },
  }),
};

const THEMES: { id: TripTheme; stampKey: string; label: string; labelHe: string }[] = [
  { id: 'desert', stampKey: 'cactus',    label: 'Desert', labelHe: 'מדבר' },
  { id: 'nature', stampKey: 'pine_tree', label: 'Nature', labelHe: 'טבע'  },
  { id: 'city',   stampKey: 'museum',    label: 'City',   labelHe: 'עיר'  },
  { id: 'beach',  stampKey: 'beach',     label: 'Beach',  labelHe: 'חוף'  },
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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
  };

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* ── Cinematic warm background ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(160deg, #F5C5A0 0%, #E8A87C 25%, #D4956A 50%, #B87D6A 75%, #8B6B5A 100%)',
      }} />
      {/* Warm ambient orbs */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-15%', width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,200,130,0.55) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-20%', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,120,80,0.45) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '10%', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,230,180,0.30) 0%, transparent 70%)',
        filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Main glass card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.1 }}
        style={{
          position: 'relative', zIndex: 10,
          width: 'calc(100% - 48px)',
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderRadius: 40,
          padding: '52px 36px 44px',
          boxShadow: '0 40px 80px rgba(26,20,16,0.20), 0 8px 32px rgba(26,20,16,0.12)',
          border: '1px solid rgba(255,255,255,0.90)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Specular shine */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 55%, rgba(255,255,255,0.08) 100%)',
          pointerEvents: 'none', borderRadius: 'inherit',
        }} />

        {/* Compass */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
        >
          <CompassMark size={72} />
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 28 }}
          style={{ marginBottom: 16 }}
        >
          <h1 dir="ltr" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2.6rem, 10vw, 3.8rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--forest-dk)',
            lineHeight: 1,
            marginBottom: 0,
          }}>
            Trippy<span style={{ color: 'var(--terra)' }}>.</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, type: 'spring', stiffness: 280, damping: 28 }}
          style={{ marginBottom: 20 }}
        >
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.3rem, 5vw, 1.75rem)',
            fontStyle: 'italic',
            color: 'var(--ink-soft)',
            lineHeight: 1.35,
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}>
            {t('appTagline')}
          </p>
        </motion.div>

        {/* Body copy */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            color: 'var(--text-2)',
            lineHeight: 1.6,
            marginBottom: 36,
            maxWidth: 320,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Experience the new standard in collaborative travel. From desert dunes to city lights, your journey begins here.
        </motion.p>

        {webView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48 }}
            style={{
              marginBottom: 16, padding: '12px 14px',
              background: 'rgba(255,180,0,0.10)', border: '1px solid rgba(255,180,0,0.35)',
              borderRadius: 16, fontSize: 13, lineHeight: 1.5, color: 'var(--text)',
              textAlign: 'left',
            }}
          >
            <span style={{ fontWeight: 700 }}>⚠️ </span>
            {t('webViewWarning')}
          </motion.div>
        )}

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 280, damping: 26 }}
          onClick={handleGoogle}
          disabled={googleLoading}
          whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '18px 28px', minHeight: 60,
            background: 'var(--brand)',
            border: 'none',
            borderRadius: 9999,
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: googleLoading ? 'wait' : 'pointer',
            opacity: googleLoading ? 0.7 : 1,
            boxShadow: '0 8px 28px rgba(59,110,82,0.35), 0 2px 8px rgba(59,110,82,0.20)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <span>{googleLoading ? '…' : t('startAdventure') || 'Start an Adventure'}</span>
          {!googleLoading && (
            <span style={{ fontSize: 20, lineHeight: 1 }}>→</span>
          )}
        </motion.button>
      </motion.div>

      {/* ── Footer tagline ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          position: 'relative', zIndex: 10,
          marginTop: 28,
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <span>Collaborate</span>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.40)', flexShrink: 0 }} />
        <span>Discover</span>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.40)', flexShrink: 0 }} />
        <span>Document</span>
      </motion.div>
    </div>
  );
}

// ─── Step 2: Trip ─────────────────────────────────────────────────────────────

type UserTrip = { id: string; name: string; theme: string | null; days: number; start_date: string | null };

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

  const [cName,  setCName]  = useState('');
  const [cNick,  setCNick]  = useState(authUser?.username ?? '');
  const [cTheme, setCTheme] = useState<TripTheme>('desert');
  const [cDate,  setCDate]  = useState(new Date().toISOString().split('T')[0]);
  const [cEndDate, setCEndDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  });
  const [cCountries, setCCountries] = useState<string[]>([]);
  const [cCurrency, setCCurrency] = useState('USD');

  const calcDays = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.min(90, Math.round(ms / 86_400_000) + 1));
  };

  const handleCreate = async () => {
    if (!cName.trim()) { show(t('enterTripName')); return; }
    if (!cNick.trim()) { show(t('enterNickname')); return; }
    if (cEndDate < cDate) { show(locale === 'he' ? 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה' : 'End date must be after start date'); return; }
    setLoading(true);
    try {
      const days = calcDays(cDate, cEndDate);
      await createTrip(cName, days, cNick, cTheme, cDate, cCountries, cCurrency);
    } catch (err: any) {
      const msg = (err?.message ?? '').toLowerCase();
      if (msg.includes('not authenticated')) {
        show(locale === 'he' ? 'לא מחובר — נסה להתנתק ולהתחבר מחדש' : 'Not signed in — please sign out and sign in again');
      } else if (msg.includes('row-level security') || msg.includes('violates') || msg.includes('rls')) {
        show(locale === 'he'
          ? 'שגיאת הרשאות Supabase — יש להפעיל RLS policy בלוח הניהול'
          : 'Supabase RLS error — run the INSERT policy in your Supabase dashboard');
      } else {
        show(`${t('createTripFailed')}: ${err?.message ?? ''}`);
      }
    }
    setLoading(false);
  };

  const handleAccept = async (invitationId: string) => {
    setActionId(invitationId);
    try {
      await acceptInvitation(invitationId);
    } catch (err: any) {
      const msg = err?.message === 'not_found' || err?.message === 'Invitation not found'
        ? t('tripNotFound')
        : (locale === 'he' ? '⚠️ שגיאה בקבלת ההזמנה — נסה שוב' : '⚠️ Could not accept invitation — please try again');
      show(msg);
    }
    setActionId(null);
  };

  const handleReject = async (invitationId: string) => {
    setActionId(invitationId);
    await rejectInvitation(invitationId);
    setActionId(null);
  };

  const selectedTheme = THEMES.find(th => th.id === cTheme) ?? THEMES[0];
  const themeEmoji = (theme: string | null) =>
    theme === 'city' ? '🌆' : theme === 'beach' ? '🏖️' : theme === 'nature' ? '🌲' : theme === 'mountain' ? '⛰️' : theme === 'snow' ? '❄️' : '🏜️';

  return (
    <div style={{
      height: '100%', overflowY: 'auto', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      padding: '0 20px', WebkitOverflowScrolling: 'touch' as any,
      background: 'var(--bg)',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        paddingTop: 'max(40px, env(safe-area-inset-top, 40px))',
        paddingBottom: 'max(48px, env(safe-area-inset-bottom, 48px))',
      }}>

        {/* Wordmark */}
        <motion.div custom={-1} variants={card} initial="hidden" animate="visible"
          style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <CompassMark size={28} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 22, fontWeight: 700,
              letterSpacing: '-0.04em',
              color: 'var(--forest-dk)',
              lineHeight: 1,
            }}>
              Trippy<span style={{ color: 'var(--terra)' }}>.</span>
            </span>
          </div>
        </motion.div>

        {/* User bar */}
        <motion.div custom={0} variants={card} initial="hidden" animate="visible" style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.80)',
            backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            border: '1px solid rgba(255,255,255,0.90)',
            borderRadius: 24, padding: '12px 16px',
            boxShadow: '0 4px 16px rgba(26,20,16,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: 'var(--brand)',
              }}>
                {(authUser?.username ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{t('signedInAs')}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{authUser?.username}</div>
              </div>
            </div>
            <GlassBtn size="sm" onClick={logout} style={{ fontSize: 12 }}>{t('signOut')}</GlassBtn>
          </div>
        </motion.div>

        {/* Pending invitations */}
        <AnimatePresence>
          {pendingInvitations.length > 0 && (
            <motion.div
              key="invites"
              custom={1} variants={card} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 12 }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.80)',
                backdropFilter: 'blur(40px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                border: '1px solid rgba(255,255,255,0.90)',
                borderRadius: 28, padding: '20px 20px', boxShadow: '0 4px 16px rgba(26,20,16,0.07)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--terra)', marginBottom: 12,
                }}>
                  {t('invitations')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingInvitations.map(inv => (
                    <div key={inv.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 18,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{themeEmoji(inv.tripTheme)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inv.tripName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{t('invitedToJoin')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <GlassBtn variant="accent" size="sm" onClick={() => handleAccept(inv.id)} disabled={actionId !== null} style={{ fontSize: 12, padding: '5px 12px' }}>
                          {actionId === inv.id ? '…' : t('acceptBtn')}
                        </GlassBtn>
                        <GlassBtn size="sm" onClick={() => handleReject(inv.id)} disabled={actionId !== null} style={{ fontSize: 12, padding: '5px 12px' }}>
                          {t('rejectBtn')}
                        </GlassBtn>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Trips */}
        {(tripsLoading || userTrips.length > 0) && (
          <motion.div custom={2} variants={card} initial="hidden" animate="visible" style={{ marginBottom: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
              border: '1px solid rgba(255,255,255,0.90)',
              borderRadius: 28, padding: '20px 20px',
              boxShadow: '0 4px 16px rgba(26,20,16,0.07)',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--terra)', marginBottom: 12,
              }}>
                {t('myTrips')}
              </p>
              {tripsLoading ? (
                <div style={{ color: 'var(--text-2)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>…</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {userTrips.map(trip => (
                    <motion.button
                      key={trip.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={async () => {
                        setLoadingTripId(trip.id);
                        try { await loadTripById(trip.id); } catch { show(t('tripNotFound')); } finally { setLoadingTripId(null); }
                      }}
                      disabled={loadingTripId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '13px 14px', borderRadius: 18,
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        cursor: 'pointer', width: '100%', textAlign: locale === 'he' ? 'right' : 'left',
                        opacity: loadingTripId && loadingTripId !== trip.id ? 0.5 : 1,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{themeEmoji(trip.theme)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {trip.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                          {trip.days} {t('days')}{trip.start_date ? ` · ${trip.start_date}` : ''}
                        </div>
                      </div>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ color: '#fff', fontSize: 14 }}>{loadingTripId === trip.id ? '…' : '→'}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Create + Demo buttons */}
        <motion.div custom={3} variants={card} initial="hidden" animate="visible" style={{ marginBottom: 8 }}>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '15px 24px', minHeight: 52,
              background: 'var(--brand)', border: 'none', borderRadius: 9999,
              color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
              fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(59,110,82,0.28)',
            }}
          >
            <Icon name="plus" size={15} /> {t('createNewTrip')}
          </button>
        </motion.div>
        <motion.div custom={4} variants={card} initial="hidden" animate="visible">
          <button
            onClick={loadDemoTrip}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 24px', minHeight: 48,
              background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.90)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 9999, color: 'var(--text-2)',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(26,20,16,0.06)',
            }}
          >
            ✨ {t('tryDemo')}
          </button>
        </motion.div>

        {/* Create trip sheet */}
        {showCreate && (
          <Sheet
            onClose={() => setShowCreate(false)}
            title={t('createNewTrip')}
            subtitle={locale === 'he' ? selectedTheme.labelHe : selectedTheme.label}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Theme */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>
                  {t('backgroundLabel')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {THEMES.map(th => (
                    <motion.button key={th.id} whileTap={{ scale: 0.93 }} onClick={() => setCTheme(th.id)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '16px 8px', borderRadius: 24, cursor: 'pointer',
                      background: cTheme === th.id ? 'rgba(255,255,255,0.95)' : 'var(--bg)',
                      border: cTheme === th.id ? '2px solid var(--brand)' : '1px solid var(--border)',
                      boxShadow: cTheme === th.id ? '0 4px 16px rgba(59,110,82,0.18)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                      <StampIcon iconKey={th.stampKey} size={52} />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: cTheme === th.id ? 'var(--brand)' : 'var(--text-2)',
                      }}>
                        {locale === 'he' ? th.labelHe : th.label}
                      </span>
                      {cTheme === th.id && (
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--sand)', border: '1.5px solid var(--sand)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  {t('currencyLabel')}
                </label>
                <select
                  value={cCurrency}
                  onChange={e => setCCurrency(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)',
                    fontSize: 15, fontWeight: 500, minHeight: 44,
                    background: 'var(--bg)', color: 'var(--text)',
                    border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {locale === 'he' ? c.labelHe : c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    {t('startDateLabel')}
                  </label>
                  <input
                    type="date" value={cDate} onChange={e => setCDate(e.target.value)}
                    className="input-premium"
                    style={{
                      width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)',
                      fontSize: 15, fontWeight: 500, minHeight: 44,
                      background: 'var(--bg)', color: 'var(--text)',
                      border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    {locale === 'he' ? 'תאריך סיום' : 'End date'}
                  </label>
                  <input
                    type="date" value={cEndDate} min={cDate} onChange={e => setCEndDate(e.target.value)}
                    className="input-premium"
                    style={{
                      width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)',
                      fontSize: 15, fontWeight: 500, minHeight: 44,
                      background: 'var(--bg)', color: 'var(--text)',
                      border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
              </div>
              {cDate && cEndDate && cEndDate >= cDate && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, textAlign: 'center', marginTop: -6 }}>
                  {calcDays(cDate, cEndDate)} {locale === 'he' ? 'ימים' : 'days'}
                </p>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '16px 24px', minHeight: 52,
                  background: 'var(--brand)', border: 'none', borderRadius: 9999,
                  color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
                  fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                  marginTop: 4,
                  boxShadow: '0 6px 20px rgba(59,110,82,0.28)',
                }}
              >
                <Icon name="check" size={15} /> {loading ? '…' : t('createBtn')}
              </button>
            </div>
          </Sheet>
        )}

      </div>
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
          transition={{ duration: 0.25 }}>
          <AuthStep />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
