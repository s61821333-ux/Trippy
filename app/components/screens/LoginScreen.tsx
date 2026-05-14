'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Field from '../ui/Field';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import CountriesInput from '../ui/CountriesInput';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';
import { TripTheme } from '@/lib/types';
import { dbGetUserTrips } from '@/lib/db';

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, type: 'spring' as const, stiffness: 340, damping: 32 },
  }),
};

const THEMES: { id: TripTheme; emoji: string; label: string; labelHe: string }[] = [
  { id: 'desert', emoji: '🏜️', label: 'Desert', labelHe: 'מדבר' },
  { id: 'nature', emoji: '🌲', label: 'Nature', labelHe: 'טבע'  },
  { id: 'city',   emoji: '🌆', label: 'City',   labelHe: 'עיר'  },
  { id: 'beach',  emoji: '🏖️', label: 'Beach',  labelHe: 'חוף'  },
];

// ─── Step 1: Auth ─────────────────────────────────────────────────────────────

function AuthStep() {
  const { signInWithGoogle } = useAppStore();
  const { t } = useI18n();

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
    // Page will redirect; no need to reset loading
  };

  return (
    <div style={{
      height: '100%', overflowY: 'auto', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      padding: '0 24px', WebkitOverflowScrolling: 'touch' as any,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        paddingTop: 'max(60px, env(safe-area-inset-top, 60px))',
        paddingBottom: 'max(80px, env(safe-area-inset-bottom, 80px))',
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>

        {/* Logo */}
        <motion.div custom={0} variants={card} initial="hidden" animate="visible"
          style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: 12, lineHeight: 1.2 }}>🌍</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 800,
            letterSpacing: '-0.03em', color: 'var(--brand)', lineHeight: 1.05, marginBottom: 8,
          }}>
            {t('appName')}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 400, lineHeight: 1.5 }}>
            {t('appTagline')}
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div custom={1} variants={card} initial="hidden" animate="visible" style={{ marginBottom: 10 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-md)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 18 }}>
              {t('loginBtn')}
            </h2>
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '11px 16px',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
                color: 'var(--text)', cursor: 'pointer',
                transition: 'opacity 0.15s',
                opacity: googleLoading ? 0.6 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? '…' : t('signInWithGoogle')}
            </button>
          </div>
        </motion.div>

      </div>
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
  const [cDays,  setCDays]  = useState('3');
  const [cNick,  setCNick]  = useState(authUser?.username ?? '');
  const [cTheme, setCTheme] = useState<TripTheme>('desert');
  const [cDate,  setCDate]  = useState(new Date().toISOString().split('T')[0]);
  const [cCountries, setCCountries] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!cName.trim()) { show(t('enterTripName')); return; }
    if (!cNick.trim()) { show(t('enterNickname')); return; }
    setLoading(true);
    try {
      const days = Math.min(30, Math.max(1, parseInt(cDays, 10) || 3));
      await createTrip(cName, days, cNick, cTheme, cDate, cCountries);
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
      padding: '0 24px', WebkitOverflowScrolling: 'touch' as any,
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        paddingTop: 'max(40px, env(safe-area-inset-top, 40px))',
        paddingBottom: 'max(40px, env(safe-area-inset-bottom, 40px))',
      }}>

        {/* User bar */}
        <motion.div custom={0} variants={card} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '12px 16px', boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: 'var(--brand)',
              }}>
                {(authUser?.username ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{t('signedInAs')}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{authUser?.username}</div>
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
              style={{ marginBottom: 10 }}
            >
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '20px 24px', boxShadow: 'var(--shadow-md)',
              }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.01em' }}>
                  {t('invitations')}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingInvitations.map(inv => (
                    <div key={inv.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg)', border: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{themeEmoji(inv.tripTheme)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inv.tripName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{t('invitedToJoin')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <GlassBtn
                          variant="accent" size="sm"
                          onClick={() => handleAccept(inv.id)}
                          disabled={actionId !== null}
                          style={{ fontSize: 12, padding: '5px 12px' }}
                        >
                          {actionId === inv.id ? '…' : t('acceptBtn')}
                        </GlassBtn>
                        <GlassBtn
                          size="sm"
                          onClick={() => handleReject(inv.id)}
                          disabled={actionId !== null}
                          style={{ fontSize: 12, padding: '5px 12px' }}
                        >
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

        {/* Your existing trips */}
        {(tripsLoading || userTrips.length > 0) && (
          <motion.div custom={2} variants={card} initial="hidden" animate="visible" style={{ marginBottom: 10 }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '20px 24px', boxShadow: 'var(--shadow-md)',
            }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.01em' }}>
                {t('myTrips')}
              </h2>
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
                        try {
                          await loadTripById(trip.id);
                        } catch {
                          show(t('tripNotFound'));
                        } finally {
                          setLoadingTripId(null);
                        }
                      }}
                      disabled={loadingTripId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        cursor: 'pointer', width: '100%', textAlign: locale === 'he' ? 'right' : 'left',
                        opacity: loadingTripId && loadingTripId !== trip.id ? 0.5 : 1,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{themeEmoji(trip.theme)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {trip.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                          {trip.days} {t('days')}{trip.start_date ? ` · ${trip.start_date}` : ''}
                        </div>
                      </div>
                      <span style={{ color: 'var(--brand)', fontSize: 16, flexShrink: 0 }}>
                        {loadingTripId === trip.id ? '…' : '→'}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Create trip */}
        <motion.div custom={3} variants={card} initial="hidden" animate="visible" style={{ marginBottom: 8 }}>
          <GlassBtn onClick={() => setShowCreate(true)} style={{ width: '100%' }}>
            <Icon name="plus" size={15} /> {t('createNewTrip')}
          </GlassBtn>
        </motion.div>

        {/* Demo */}
        <motion.div custom={4} variants={card} initial="hidden" animate="visible">
          <GlassBtn onClick={loadDemoTrip} style={{ width: '100%' }}>
            ✨ {t('tryDemo')}
          </GlassBtn>
        </motion.div>

        {/* Create trip sheet */}
        {showCreate && (
          <Sheet
            onClose={() => setShowCreate(false)}
            title={t('createNewTrip')}
            subtitle={`${selectedTheme.emoji} ${locale === 'he' ? selectedTheme.labelHe : selectedTheme.label}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Theme */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>
                  {t('backgroundLabel')}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {THEMES.map(th => (
                    <motion.button key={th.id} whileTap={{ scale: 0.93 }} onClick={() => setCTheme(th.id)} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '10px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      background: cTheme === th.id ? 'var(--brand-light)' : 'var(--bg)',
                      border: cTheme === th.id ? '2px solid var(--brand)' : '1px solid var(--border)',
                      transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: 22 }}>{th.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cTheme === th.id ? 'var(--brand)' : 'var(--text-2)' }}>
                        {locale === 'he' ? th.labelHe : th.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Field label={t('tripName')} placeholder={t('createPlaceholderName')} value={cName} onChange={setCName} icon={<Icon name="tent" size={15} />} />
              <Field label={t('yourNickname')} placeholder={t('createPlaceholderNick')} value={cNick} onChange={setCNick} icon={<Icon name="user" size={15} />} />

              <CountriesInput label={t('countriesLabel')} value={cCountries} onChange={setCCountries} />

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label={t('numDays')} type="number" placeholder="10" value={cDays} onChange={setCDays} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    {t('startDateLabel')}
                  </label>
                  <input
                    type="date" value={cDate} onChange={e => setCDate(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                      fontSize: 14, fontWeight: 500, background: 'var(--bg)', color: 'var(--text)',
                      border: '1px solid var(--border)', outline: 'none', boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
              </div>

              <GlassBtn variant="accent" size="lg" onClick={handleCreate} style={{ width: '100%', marginTop: 4 }} disabled={loading}>
                <Icon name="check" size={15} /> {loading ? '…' : t('createBtn')}
              </GlassBtn>
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

  // checkAuth is already called by AppShell on mount — no second call needed here.

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
          initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
          <AuthStep />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
