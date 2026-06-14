'use client';

import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../ui/Toast';
import { dbGetUserTrips } from '@/lib/db';
import Icon from '../ui/Icon';
import Btn from '../ui/Btn';
import GlassBtn from '../ui/GlassBtn';
import Sheet from '../ui/Sheet';
import { StampIcon } from '../ui/StampIcon';
import { CompassLoader, LoaderStyles, BRAND_THEME } from '../ui/TripLoaders';
import Field from '../ui/Field';
import StatementHeading from '../ui/StatementHeading';
import HairlineRow from '../ui/HairlineRow';
import AvatarStack from '../ui/AvatarStack';
import Eyebrow from '../ui/Eyebrow';
import CountriesInput from '../ui/CountriesInput';
import { TripTheme } from '@/lib/types';
import { CURRENCIES, getCountryCurrency } from '@/lib/currency';
import { formatDateRange } from '@/lib/dates';
import dynamic from 'next/dynamic';

const PlanWithAISheet = dynamic(() => import('./PlanWithAISheet'));

// ── Constants ─────────────────────────────────────────────────────────────────

const THEME_STAMP: Record<string, string> = {
  desert:   'cactus',
  nature:   'pine_tree',
  city:     'museum',
  beach:    'beach',
  mountain: 'mountain',
  lake:     'kayak',
  sunset:   'sunrise',
  space:    'stargaze',
  snow:     'mountain',
};

const THEMES: { id: TripTheme; label: string; labelHe: string; bg: string; accent: string }[] = [
  { id: 'desert',   label: 'Desert',   labelHe: 'מדבר',  bg: '#FFF4EC', accent: '#C4714A' },
  { id: 'nature',   label: 'Nature',   labelHe: 'טבע',   bg: '#EDF5EF', accent: '#3B6E52' },
  { id: 'city',     label: 'City',     labelHe: 'עיר',   bg: '#F0F0F4', accent: '#3A2E26' },
  { id: 'beach',    label: 'Beach',    labelHe: 'חוף',   bg: '#E8F7F9', accent: '#2B7A8E' },
  { id: 'mountain', label: 'Mountain', labelHe: 'הרים',  bg: '#EEF0F5', accent: '#4B5E7A' },
  { id: 'lake',     label: 'Lake',     labelHe: 'אגם',   bg: '#E5F0F5', accent: '#1B6A8A' },
  { id: 'sunset',   label: 'Sunset',   labelHe: 'שקיעה', bg: '#FFF0E5', accent: '#D4531A' },
  { id: 'space',    label: 'Space',    labelHe: 'חלל',   bg: '#1A1A2E', accent: '#2B7A8E' },
];

type UserTrip = { id: string; name: string; theme: string | null; days: number; start_date: string | null };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Whole days from today until a trip's start date (null if no date / past). */
function daysUntil(start: string | null): number | null {
  if (!start) return null;
  const ms = new Date(start + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0);
  const d = Math.ceil(ms / 86_400_000);
  return d >= 0 ? d : null;
}

// ── CreateSheet ───────────────────────────────────────────────────────────────

function CreateSheet({ onClose }: { onClose: () => void }) {
  const { createTrip, authUser } = useAppStore();
  const { t, locale, isRTL } = useI18n();
  const { show } = useToast();

  const [loading,          setLoading]          = useState(false);
  const [cName,            setCName]            = useState('');
  const [cNick,            setCNick]            = useState(authUser?.username ?? '');
  const [cTheme,           setCTheme]           = useState<TripTheme>('desert');
  const [cDate,            setCDate]            = useState(new Date().toISOString().split('T')[0]);
  const [cEndDate,         setCEndDate]         = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().split('T')[0];
  });
  const [cCountries,       setCCountries]       = useState<string[]>([]);
  const [cCurrency,        setCCurrency]        = useState('USD');
  const [currencyTouched,  setCurrencyTouched]  = useState(false);

  // Auto-derive currency from first chosen country until user overrides
  useEffect(() => {
    if (currencyTouched) return;
    if (cCountries.length) setCCurrency(getCountryCurrency(cCountries[0]));
  }, [cCountries, currencyTouched]);

  const calcDays = (s: string, e: string) =>
    Math.max(1, Math.min(90, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86_400_000) + 1));

  const handleCreate = async () => {
    if (!cName.trim()) { show(t('enterTripName')); return; }
    if (!cNick.trim()) { show(t('enterNickname')); return; }
    if (cEndDate < cDate) {
      show(locale === 'he'
        ? 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה'
        : 'End date must be after start date');
      return;
    }
    setLoading(true);
    try {
      await createTrip(cName, calcDays(cDate, cEndDate), cNick, cTheme, cDate, cCountries, cCurrency);
    } catch (err: any) {
      const msg = (err?.message ?? '').toLowerCase();
      if (msg.includes('not authenticated')) {
        show(locale === 'he'
          ? 'לא מחובר - נסה להתנתק ולהתחבר מחדש'
          : 'Not signed in - please sign out and sign in again');
      } else if (msg.includes('row-level security') || msg.includes('violates') || msg.includes('rls')) {
        show(locale === 'he' ? 'שגיאת הרשאות Supabase' : 'Supabase permissions error - contact support');
      } else {
        show(`${t('createTripFailed')}: ${err?.message ?? ''}`);
      }
    }
    setLoading(false);
  };

  const selectedTheme = THEMES.find(th => th.id === cTheme) ?? THEMES[0];

  return (
    <Sheet
      onClose={onClose}
      title={t('createNewTrip')}
      subtitle={locale === 'he' ? 'כמה פרטים ואתם בדרך.' : 'A few details and the adventure begins.'}
      full
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Theme picker - horizontal scroller */}
        <div>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700,
            color: 'var(--text-2)', marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.10em',
            fontFamily: 'var(--font-mono)',
          }}>
            {t('backgroundLabel')}
          </label>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto',
            scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
            paddingInline: 2, paddingBottom: 4,
            WebkitMaskImage: isRTL
              ? 'linear-gradient(to left, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)'
              : 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)',
            maskImage: isRTL
              ? 'linear-gradient(to left, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)'
              : 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)',
          } as React.CSSProperties}>
            {THEMES.map(th => (
              <button
                key={th.id}
                onClick={() => setCTheme(th.id)}
                aria-pressed={cTheme === th.id}
                style={{
                  flexShrink: 0, scrollSnapAlign: 'start',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 10px', width: 88, minHeight: 104,
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  background:  cTheme === th.id ? th.bg   : 'var(--bg)',
                  border:      cTheme === th.id ? `2px solid ${th.accent}` : '1.5px solid var(--border)',
                  boxShadow:   cTheme === th.id ? `0 4px 18px ${th.accent}30` : 'none',
                  transition:  'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                  WebkitTapHighlightColor: 'transparent',
                  position: 'relative',
                }}
              >
                <StampIcon iconKey={THEME_STAMP[th.id] ?? 'cactus'} size={40} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: cTheme === th.id ? th.accent : 'var(--text-2)',
                  transition: 'color 0.15s',
                }}>
                  {locale === 'he' ? th.labelHe : th.label}
                </span>
                {cTheme === th.id && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 16, height: 16, borderRadius: '50%', background: th.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="check" size={9} style={{ color: '#fff' }} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Trip name */}
        <Field
          label={t('tripName')}
          placeholder={t('createPlaceholderName')}
          value={cName}
          onChange={setCName}
          icon={<Icon name="tent" size={15} />}
        />

        {/* Dates - responsive, never overlapping */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ flex: '1 1 calc(50% - 5px)', minWidth: 140 }}>
            <Field
              type="date"
              label={t('startDateLabel')}
              value={cDate}
              onChange={setCDate}
            />
          </div>
          <div style={{ flex: '1 1 calc(50% - 5px)', minWidth: 140 }}>
            <Field
              type="date"
              label={locale === 'he' ? 'תאריך סיום' : 'End date'}
              value={cEndDate}
              onChange={setCEndDate}
              min={cDate}
            />
          </div>
        </div>

        {cDate && cEndDate && cEndDate >= cDate && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, textAlign: 'center', marginTop: -6 }}>
            {calcDays(cDate, cEndDate)} {locale === 'he' ? 'ימים' : 'days'}
          </p>
        )}

        {/* Destinations */}
        <CountriesInput label={t('countriesLabel')} value={cCountries} onChange={setCCountries} />

        {/* Currency - auto-filled from country */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
            {t('currencyLabel')}
          </label>
          <select
            value={cCurrency}
            onChange={e => { setCurrencyTouched(true); setCCurrency(e.target.value); }}
            style={{
              width: '100%', padding: '11px 12px',
              borderRadius: 14, fontSize: 16, fontWeight: 500, minHeight: 44,
              background: 'var(--field-bg)', color: 'var(--text)',
              boxShadow: 'inset 0 0 0 1px var(--field-border), inset 0 1px 0 oklch(100% 0 0 / 44%)',
              border: 'none', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'var(--font-friendly), var(--font-sans)',
              backdropFilter: 'blur(20px) saturate(1.8)',
            }}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} - {locale === 'he' ? c.labelHe : c.label}
              </option>
            ))}
          </select>
          {!currencyTouched && cCountries.length > 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              {locale === 'he'
                ? `מטבע נקבע לפי ${cCountries[0]}`
                : `Set from ${cCountries[0]} - change anytime`}
            </p>
          )}
        </div>

        {/* Nickname */}
        <Field
          label={t('yourNickname')}
          placeholder={t('createPlaceholderNick')}
          value={cNick}
          onChange={setCNick}
          icon={<Icon name="user" size={15} />}
        />

        <Btn
          kind="forest"
          full
          onClick={handleCreate}
          disabled={loading}
          style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading
            ? <CompassLoader theme={BRAND_THEME} size={22} />
            : <><Icon name="check" size={15} />{t('createBtn')}</>
          }
        </Btn>
      </div>
    </Sheet>
  );
}

// ── Home_V2 ───────────────────────────────────────────────────────────────────

export default function Home_V2() {
  const { authUser, tripDbId, loadTripById, logout } = useAppStore();
  const { t, locale } = useI18n();
  const { show } = useToast();

  const [trips,         setTrips]         = useState<UserTrip[]>([]);
  const [tripsLoading,  setTripsLoading]  = useState(false);
  const [loadingTripId, setLoadingTripId] = useState<string | null>(null);
  const [showCreate,    setShowCreate]    = useState(false);
  const [showAIPlan,    setShowAIPlan]    = useState(false);

  const initials = (authUser?.username ?? '?')
    .split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!authUser?.id) return;
    setTripsLoading(true);
    dbGetUserTrips(authUser.id)
      .then(setTrips)
      .catch(() => {})
      .finally(() => setTripsLoading(false));
  }, [authUser?.id]);

  const handleOpen = async (tripId: string) => {
    if (loadingTripId) return;
    setLoadingTripId(tripId);
    try { await loadTripById(tripId, { showLoader: true, showEntry: true }); }
    catch { show(t('tripNotFound')); }
    finally { setLoadingTripId(null); }
  };

  return (
    <div
      className="lg-scroll"
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', paddingBottom: 'var(--navbar-clearance)' }}
    >
      <LoaderStyles />
      {/* ── Editorial header (dark hero removed - HANDOFF Home) ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 0' }}>

        {/* Wordmark + avatar + sign-out */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'env(safe-area-inset-top, 0px)', marginBottom: 30 }}>
          <span className="wm" style={{ fontSize: 20, color: 'var(--text)' }}>
            Trippy<span className="dot">.</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              aria-label={authUser?.username}
              style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'var(--brand)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
                boxShadow: 'var(--lg-glow-forest)',
              }}
            >
              {initials}
            </div>
            <GlassBtn
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              aria-label={t('signOut')}
              style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
            >
              <Icon name="logout" size={15} />
            </GlassBtn>
          </div>
        </div>

        {/* Greeting eyebrow + two-tone statement headline */}
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <Eyebrow tone="terra" style={{ marginBottom: 12 }}>{t('hi')}, {authUser?.username}</Eyebrow>
        </m.div>
        <StatementHeading
          size="lg"
          lines={[
            t('homeHeroTitle').replace(/\n/g, ' '),
            tripsLoading ? ' '
              : trips.length === 0 ? t('homeStatementEmpty')
              : trips.length === 1 ? t('homeStatementOne')
              : t('homeStatementMany').replace('{n}', String(trips.length)),
          ]}
          style={{ marginBottom: 24 }}
        />

        {/* Primary action - one forest pill */}
        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 30 }}
        >
          <Btn
            kind="forest"
            full
            onClick={() => setShowCreate(true)}
            aria-label={t('createNewTrip')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <Icon name="plus" size={19} color="#fff" />
            {t('createNewTrip')}
          </Btn>
        </m.div>

        {/* Plan with AI - full itinerary generator (hidden for now) */}

        {/* ── Resume banner - shown when a previous trip session is remembered ── */}
        {(() => {
          const lastTrip = tripDbId ? trips.find(tr => tr.id === tripDbId) : null;
          if (!lastTrip) return null;
          const isLoading = loadingTripId === lastTrip.id;
          const stampKey = THEME_STAMP[lastTrip.theme ?? ''] ?? 'cactus';
          return (
            <m.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.20, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginBottom: 22 }}
            >
              <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
                {locale === 'he' ? 'ממשיכים מאיפה שעצרתם?' : 'Pick up where you left off'}
              </p>
              <button
                onClick={() => handleOpen(lastTrip.id)}
                disabled={loadingTripId !== null}
                aria-label={`Resume ${lastTrip.name}`}
                aria-busy={isLoading}
                className="lg"
                style={{
                  display: 'flex', alignItems: 'center', gap: 15,
                  padding: 18, textAlign: 'start',
                  border: '2px solid var(--lg-terra)', width: '100%',
                  cursor: loadingTripId && !isLoading ? 'default' : 'pointer',
                  opacity: loadingTripId && !isLoading ? 0.48 : 1,
                  transition: 'opacity 0.18s',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  boxShadow: '0 4px 18px oklch(62% 0.12 50 / 12%)',
                }}
              >
                <StampIcon iconKey={stampKey} size={52} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="eyebrow-lg" style={{ color: 'var(--terra-text)', fontSize: 9, marginBottom: 2 }}>
                    {formatDateRange(lastTrip.start_date, lastTrip.days, locale)} · {lastTrip.days} {locale === 'he' ? 'ימים' : 'days'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontWeight: 800,
                    fontSize: 20, letterSpacing: '-0.03em',
                    color: 'var(--lg-ink)', lineHeight: 1.1,
                    marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {lastTrip.name}
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: 12, fontFamily: 'var(--font-sans)',
                    fontWeight: 600, color: 'var(--lg-terra)',
                  }}>
                    {locale === 'he' ? 'המשך' : 'Resume trip'} →
                  </div>
                </div>
                <span
                  className="lg-btn lg-btn-forest"
                  aria-hidden="true"
                  style={{
                    width: 40, height: 40, padding: 0, flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 9999,
                  }}
                >
                  {isLoading
                    ? <CompassLoader theme={BRAND_THEME} size={22} />
                    : <Icon name="arrow" size={17} color="#fff" />
                  }
                </span>
              </button>
            </m.div>
          );
        })()}

        {/* ── Empty state ── */}
        {!tripsLoading && trips.length === 0 && (
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '32px 0 8px', textAlign: 'center' }}
          >
            <StampIcon iconKey="compass" size={72} />
            <div>
              <p className="text-display-sm" style={{ margin: '0 0 6px' }}>
                {t('noTripsTitle')}
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: 0 }}>
                {t('noTripsSub')}
              </p>
            </div>
          </m.div>
        )}

        {/* ── Trips list - hairline rows (HANDOFF rule 4) ── */}
        {(tripsLoading || trips.length > 0) && (
          <>
            <Eyebrow style={{ marginBottom: 4 }}>{t('myTrips')}</Eyebrow>

            {tripsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <CompassLoader theme={BRAND_THEME} size={56} />
              </div>
            ) : (
              <div role="list" aria-label={t('myTrips')}>
                {trips.map((trip, i) => {
                  const stampKey = THEME_STAMP[trip.theme ?? ''] ?? 'cactus';
                  const isLoading = loadingTripId === trip.id;
                  const dleft = daysUntil(trip.start_date);
                  const soon = dleft !== null && dleft < 90;

                  return (
                    <m.div
                      key={trip.id}
                      role="listitem"
                      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 0.06 + Math.min(i, 8) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <HairlineRow
                        onClick={() => handleOpen(trip.id)}
                        disabled={loadingTripId !== null}
                        aria-label={`Open ${trip.name}`}
                        style={{ opacity: loadingTripId && !isLoading ? 0.48 : 1, transition: 'opacity 0.18s' }}
                        leading={<StampIcon iconKey={stampKey} size={46} aria-hidden="true" />}
                        trailing={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {dleft !== null && (
                              <Eyebrow tone={soon ? 'terra' : 'muted'}>
                                {dleft} {locale === 'he' ? 'ימים' : 'days'}
                              </Eyebrow>
                            )}
                            {isLoading
                              ? <CompassLoader theme={BRAND_THEME} size={20} />
                              : (
                                <span className="rtl-flip" style={{ display: 'flex' }} aria-hidden="true">
                                  <Icon name="chevR" size={18} color="var(--text-3)" />
                                </span>
                              )}
                          </div>
                        }
                      >
                        <Eyebrow style={{ marginBottom: 3 }}>
                          {formatDateRange(trip.start_date, trip.days, locale)}
                        </Eyebrow>
                        <div style={{
                          fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 18,
                          letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.15,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {trip.name}
                        </div>
                        {authUser && (
                          <div style={{ marginTop: 7 }}>
                            <AvatarStack names={[authUser.username]} size={20} />
                          </div>
                        )}
                      </HairlineRow>
                    </m.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div style={{ height: 'max(32px, env(safe-area-inset-bottom, 32px))' }} aria-hidden="true" />
      </div>

      {/* ── CreateSheet - manual trip creation ── */}
      {showCreate && <CreateSheet onClose={() => setShowCreate(false)} />}

      {/* ── AI Trip Planner sheet ── */}
      {showAIPlan && <PlanWithAISheet onClose={() => setShowAIPlan(false)} />}
    </div>
  );
}
