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
import CountriesInput from '../ui/CountriesInput';
import { TripTheme } from '@/lib/types';
import { CURRENCIES, getCountryCurrency } from '@/lib/currency';
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
  space:    'compass',
};

const THEMES: { id: TripTheme; label: string; labelHe: string; bg: string; accent: string }[] = [
  { id: 'desert',   label: 'Desert',   labelHe: 'מדבר',  bg: '#FFF4EC', accent: '#C4714A' },
  { id: 'nature',   label: 'Nature',   labelHe: 'טבע',   bg: '#EDF5EF', accent: '#3B6E52' },
  { id: 'city',     label: 'City',     labelHe: 'עיר',   bg: '#F0F0F4', accent: '#3A2E26' },
  { id: 'beach',    label: 'Beach',    labelHe: 'חוף',   bg: '#E8F7F9', accent: '#2B7A8E' },
  { id: 'mountain', label: 'Mountain', labelHe: 'הרים',  bg: '#EEF0F5', accent: '#4B5E7A' },
  { id: 'lake',     label: 'Lake',     labelHe: 'אגם',   bg: '#E5F0F5', accent: '#1B6A8A' },
  { id: 'sunset',   label: 'Sunset',   labelHe: 'שקיעה', bg: '#FFF0E5', accent: '#D4531A' },
];

const AVC = ['#C4714A', '#C8944A', '#3B6E52', '#2B7A8E', '#A03CB4', '#1E91AF'];

type UserTrip = { id: string; name: string; theme: string | null; days: number; start_date: string | null };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateRange(startDate: string | null, days: number): string {
  if (!startDate) return `${days} days`;
  const start = new Date(startDate);
  const end   = new Date(startDate);
  end.setDate(end.getDate() + days - 1);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} → ${fmt(end)}`;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function TripAvatar({ name, index = 0, size = 22 }: { name: string; index?: number; size?: number }) {
  const initials = name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span
      aria-label={name}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: AVC[index % AVC.length], color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.4,
        boxShadow: '0 0 0 2px #fff, var(--lg-shadow)',
        boxSizing: 'border-box',
      }}
    >
      {initials}
    </span>
  );
}

// ── CreateSheet ───────────────────────────────────────────────────────────────

function CreateSheet({ onClose }: { onClose: () => void }) {
  const { createTrip, authUser } = useAppStore();
  const { t, locale } = useI18n();
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
          ? 'לא מחובר — נסה להתנתק ולהתחבר מחדש'
          : 'Not signed in — please sign out and sign in again');
      } else if (msg.includes('row-level security') || msg.includes('violates') || msg.includes('rls')) {
        show(locale === 'he' ? 'שגיאת הרשאות Supabase' : 'Supabase permissions error — contact support');
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
      subtitle={locale === 'he' ? 'כמה פרטים ואתם בדרך.' : 'A few details and you\'re on your way.'}
      full
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Theme picker — horizontal scroller */}
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
            WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)',
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

        {/* Dates — responsive, never overlapping */}
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

        {/* Currency — auto-filled from country */}
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
                {c.symbol} {c.code} — {locale === 'he' ? c.labelHe : c.label}
              </option>
            ))}
          </select>
          {!currencyTouched && cCountries.length > 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              {locale === 'he'
                ? `מטבע נקבע לפי ${cCountries[0]}`
                : `Set from ${cCountries[0]} — change anytime`}
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
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}
    >
      <LoaderStyles />
      {/* ── Dark hero header ── */}
      <div
        className="hero-mesh"
        style={{
          padding: '52px 22px 30px',
          borderRadius: '0 0 32px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Inner centering wrapper */}
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Wordmark + avatar + logout row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff' }}>
            Trippy<span style={{ color: 'var(--lg-sand)' }}>.</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              aria-label={authUser?.username}
              style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'oklch(100% 0 0 / 16%)',
                border: '2px solid oklch(100% 0 0 / 30%)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, color: '#fff',
              }}
            >
              {initials}
            </div>
            <GlassBtn
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              aria-label="Sign out"
              style={{ width: 34, height: 34, padding: 0, borderRadius: '50%', background: 'oklch(100% 0 0 / 14%)' }}
            >
              <Icon name="x" size={15} color="oklch(98% 0.005 80 / 80%)" />
            </GlassBtn>
          </div>
        </div>

        {/* Eyebrow greeting */}
        <m.p
          className="eyebrow-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: 'var(--lg-sand)', marginBottom: 6 }}
        >
          {t('hi')}, {authUser?.username}
        </m.p>

        {/* Title */}
        <m.h1
          className="display-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10, duration: 0.50, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: 40, color: '#fff', margin: 0, lineHeight: 1.05 }}
        >
          Where to<br />next?
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: 'oklch(98% 0.005 80 / 75%)', fontSize: 14,
            marginTop: 10, fontFamily: 'var(--font-sans)', margin: '10px 0 0',
          }}
        >
          {locale === 'he' ? 'כל הטיולים שלך, במקום אחד.' : 'Every journey starts here.'}
        </m.p>
        </div>{/* /inner centering wrapper */}
      </div>

      <div style={{ padding: '20px 20px 30px', marginTop: -16, position: 'relative', maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' }}>

        {/* ── Action stack ── */}
        <m.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="lg-btn lg-btn-forest"
          aria-label={t('createNewTrip')}
          style={{
            width: '100%', height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', marginBottom: 26,
            fontSize: 16, fontFamily: 'var(--font-sans)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Icon name="plus" size={20} color="#fff" />
            {t('createNewTrip')}
          </span>
          <Icon name="arrow" size={18} color="#fff" />
        </m.button>

        {/* Plan with AI — full itinerary generator (hidden for now) */}

        {/* ── Resume banner — shown when a previous trip session is remembered ── */}
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
                {locale === 'he' ? 'ממשיכים?' : 'Pick up where you left off'}
              </p>
              <button
                onClick={() => handleOpen(lastTrip.id)}
                disabled={loadingTripId !== null}
                aria-label={`Resume ${lastTrip.name}`}
                aria-busy={isLoading}
                className="lg"
                style={{
                  display: 'flex', alignItems: 'center', gap: 15,
                  padding: 18, textAlign: locale === 'he' ? 'right' : 'left',
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
                  <div className="eyebrow-lg" style={{ color: 'var(--lg-terra)', fontSize: 9, marginBottom: 2 }}>
                    {formatDateRange(lastTrip.start_date, lastTrip.days)} · {lastTrip.days} {locale === 'he' ? 'ימים' : 'days'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    fontSize: 23, color: 'var(--lg-ink)', lineHeight: 1.05,
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

        {/* ── Trips list ── */}
        {(tripsLoading || trips.length > 0) && (
          <>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 12 }}>
              {t('myTrips')}
            </p>

            {tripsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <CompassLoader theme={BRAND_THEME} size={56} />
              </div>
            ) : (
              <div
                role="list"
                aria-label={t('myTrips')}
                className="trips-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 13 }}
              >
                {trips.map((trip, i) => {
                  const stampKey = THEME_STAMP[trip.theme ?? ''] ?? 'cactus';
                  const isLoading = loadingTripId === trip.id;

                  return (
                    <m.button
                      key={trip.id}
                      role="listitem"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.10 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleOpen(trip.id)}
                      disabled={loadingTripId !== null}
                      aria-label={`Open ${trip.name}`}
                      aria-busy={isLoading}
                      className="lg"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 15,
                        padding: 15, textAlign: locale === 'he' ? 'right' : 'left',
                        border: 0,
                        cursor: loadingTripId && !isLoading ? 'default' : 'pointer',
                        opacity: loadingTripId && !isLoading ? 0.48 : 1,
                        width: '100%',
                        transition: 'opacity 0.18s',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                      }}
                    >
                      {/* Stamp */}
                      <StampIcon iconKey={stampKey} size={52} aria-hidden="true" />

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="eyebrow-lg"
                          style={{ color: 'var(--lg-terra)', fontSize: 9, marginBottom: 2 }}
                        >
                          {formatDateRange(trip.start_date, trip.days)} · {trip.days} {locale === 'he' ? 'ימים' : 'days'}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-serif)',
                          fontStyle: 'italic',
                          fontSize: 23,
                          color: 'var(--lg-ink)',
                          lineHeight: 1.05,
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {trip.name}
                        </div>
                        {authUser && (
                          <div style={{ display: 'flex', marginTop: 8 }}>
                            <TripAvatar name={authUser.username} index={0} size={22} />
                          </div>
                        )}
                      </div>

                      {/* Forest circular arrow / loader */}
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
                    </m.button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div style={{ height: 'max(32px, env(safe-area-inset-bottom, 32px))' }} aria-hidden="true" />
      </div>

      {/* ── CreateSheet — manual trip creation ── */}
      {showCreate && <CreateSheet onClose={() => setShowCreate(false)} />}

      {/* ── AI Trip Planner sheet ── */}
      {showAIPlan && <PlanWithAISheet onClose={() => setShowAIPlan(false)} />}
    </div>
  );
}
