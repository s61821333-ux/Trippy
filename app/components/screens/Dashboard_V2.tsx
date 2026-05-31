'use client';

import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { StampIcon } from '../ui/StampIcon';
import Ring from '../ui/Ring';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { fmtDate, getNextEvent, CAT_FALLBACK, fmtDuration, toMins } from '@/lib/utils';
import { fetchWeatherForTrip, WeatherDay } from '@/lib/weather';
import { getCapitalCoords } from '@/lib/capitals';
import { getTimezoneForCountry } from '@/lib/countryTimezones';
import { getCurrencySymbol } from '@/lib/currency';

const STRIPE_COLORS = ['#C4714A', '#C8944A', '#3B6E52', '#6B5CE7', '#E05A3A', '#2B8A6E', '#B45309'];

export default function DashboardScreenV2() {
  const { trip, setScreen, setActiveDay, supplies, tripDbId, currencyByTrip } = useAppStore();
  const { t, locale } = useI18n();

  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [localTime, setLocalTime] = useState('');

  // ── Derived date values ──────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = trip?.startDate ? new Date(trip.startDate + 'T00:00:00') : null;
  const endDate   = startDate ? new Date(startDate.getTime() + ((trip?.days ?? 0) - 1) * 86_400_000) : null;
  const daysUntil = startDate ? Math.round((startDate.getTime() - today.getTime()) / 86_400_000) : null;
  const currentTripDay =
    startDate && endDate && today >= startDate && today <= endDate
      ? Math.round((today.getTime() - startDate.getTime()) / 86_400_000) + 1
      : null;
  const currentDisplayDay = currentTripDay ?? 1;

  // ── Destination city + timezone ──────────────────────────────────────
  const destTimezone = trip
    ? (() => {
        for (const ev of Object.values(trip.events).flat()) {
          if ((ev as any).timezone) return (ev as any).timezone as string;
        }
        if (trip.countries?.[0]) {
          const tz = getTimezoneForCountry(trip.countries[0]);
          if (tz) return tz;
        }
        return null;
      })()
    : null;

  const destCity =
    trip?.dayMeta?.[0]?.region || trip?.countries?.[0] || trip?.name || '';

  // ── Weather fetch ────────────────────────────────────────────────────
  useEffect(() => {
    if (!trip) return;
    const isDefaultIsrael = (lat: number, lng: number) =>
      Math.abs(lat - 31) < 3 && Math.abs(lng - 35) < 3;

    let lat: number | undefined, lng: number | undefined;

    for (const meta of trip.dayMeta ?? []) {
      if (meta.lat && meta.lng && !isDefaultIsrael(meta.lat, meta.lng)) {
        lat = meta.lat; lng = meta.lng; break;
      }
    }

    if (!lat) {
      outer: for (let d = 1; d <= trip.days; d++) {
        for (const ev of trip.events[d] ?? []) {
          if ((ev as any).lat && (ev as any).lng && !isDefaultIsrael((ev as any).lat, (ev as any).lng)) {
            lat = (ev as any).lat; lng = (ev as any).lng; break outer;
          }
        }
      }
    }

    if (!lat && trip.countries?.length) {
      const capital = getCapitalCoords(trip.countries[0]);
      if (capital) { lat = capital.lat; lng = capital.lng; }
    }

    if (!lat || !lng) return;
    fetchWeatherForTrip(lat, lng, trip.startDate, trip.days)
      .then(setWeather)
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.startDate, trip?.days, trip?.countries?.join(',')]);

  // ── Live local time clock (30 s tick) ────────────────────────────────
  useEffect(() => {
    if (!destTimezone) return;
    const tick = () => {
      try {
        setLocalTime(
          new Intl.DateTimeFormat('en', {
            timeZone: destTimezone, hour: '2-digit', minute: '2-digit', hour12: false,
          }).format(new Date()),
        );
      } catch {}
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [destTimezone]);

  if (!trip) return null;

  // ── Helpers ──────────────────────────────────────────────────────────
  const handleDayClick = (day: number) => { setActiveDay(day); setScreen('day'); };

  const currency  = (tripDbId && currencyByTrip[tripDbId]) || 'USD';
  const currSym   = getCurrencySymbol(currency);
  const expenses  = trip.expenses ?? [];
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const packedCount = supplies.filter(s => s.checked).length;
  const totalCount  = supplies.length;
  const packedPct   = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const nextEvent = getNextEvent(trip);
  const todayEvs  = [...(trip.events[currentDisplayDay] ?? [])].sort(
    (a, b) => toMins(a.time) - toMins(b.time),
  );

  const todayWeather: WeatherDay | null = weather[currentDisplayDay - 1] ?? weather[0] ?? null;
  const totalEvents = Object.values(trip.events).reduce((s, evs) => s + evs.length, 0);

  const isRTL = locale === 'he';

  return (
    <div
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}
      className="lg-scroll"
    >
      {/* ══ Cinematic hero ══════════════════════════════════════════════ */}
      <div
        className="hero-mesh"
        style={{
          padding: 'calc(env(safe-area-inset-top, 0px) + 52px) 22px 22px',
          borderRadius: '0 0 34px 34px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 18,
        }}
      >
        {/* Soft terra radial glow — top-trailing corner */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: -40, insetInlineEnd: -30,
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(62% 0.17 40 / 45%), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top row: eyebrow · settings · share · crew avatars */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <span className="eyebrow-lg" style={{ color: 'oklch(98% 0.005 80 / 72%)' }}>
            {currentTripDay !== null
              ? `${t('day').toUpperCase()} ${currentTripDay}`
              : 'Active trip'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setScreen('settings')}
              className="lg-dark"
              style={{
                width: 34, height: 34, borderRadius: '50%', border: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Settings"
            >
              <Icon name="settings" size={16} color="#fff" />
            </button>

            <button
              className="lg-dark"
              style={{
                width: 34, height: 34, borderRadius: '50%', border: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Share trip"
            >
              <Icon name="share" size={16} color="#fff" />
            </button>

            {/* Crew avatars — overlapping, dark ring */}
            <div role="list" aria-label="Crew" style={{ display: 'flex', alignItems: 'center' }}>
              {trip.participants.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  role="listitem"
                  title={p.initials}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: p.color ?? STRIPE_COLORS[i % STRIPE_COLORS.length],
                    color: 'white', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid oklch(20% 0.03 60)',
                    marginInlineStart: i > 0 ? -8 : 0,
                    boxShadow: 'var(--lg-shadow)',
                    letterSpacing: '-0.02em',
                    flexShrink: 0,
                  }}
                >
                  {p.initials}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Destination eyebrow → trip name */}
        <div style={{ marginTop: 24, position: 'relative' }}>
          {(trip.countries?.length ?? 0) > 0 && (
            <p
              className="eyebrow-lg a-rise"
              style={{ color: 'var(--lg-sand)', margin: '0 0 4px' }}
            >
              {(trip.countries ?? []).join(' · ')}
            </p>
          )}
          <h1
            className="display-xl a-rise d1"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 3.2rem)', color: '#fff', margin: 0 }}
          >
            {trip.name}
          </h1>

          {/* Status chip row: countdown · weather · local time */}
          <div
            className="a-rise d2"
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}
          >
            {/* Countdown */}
            {daysUntil !== null && daysUntil > 0 && (
              <span
                className="lg-dark"
                style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}
              >
                <span
                  aria-hidden
                  style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--lg-terra-bright)', boxShadow: '0 0 8px var(--lg-terra-bright)', flexShrink: 0 }}
                />
                {daysUntil} {t('days')}
              </span>
            )}
            {currentTripDay !== null && (
              <span
                className="lg-dark"
                style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}
              >
                <span
                  aria-hidden
                  style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--lg-terra-bright)', boxShadow: '0 0 8px var(--lg-terra-bright)', flexShrink: 0 }}
                />
                {t('day')} {currentTripDay} {'of ' + trip.days}
              </span>
            )}

            {/* Weather chip */}
            {todayWeather && (
              <span
                className="lg-dark"
                style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}
              >
                <Icon name="sun" size={14} color="var(--lg-sand)" />
                {todayWeather.tempMax}° · {destCity}
              </span>
            )}

            {/* Local time chip */}
            {localTime && (
              <span
                className="lg-dark"
                style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 12 }}
              >
                <Icon name="clock" size={12} color="oklch(98% 0.005 80 / 72%)" />
                {localTime}
              </span>
            )}
          </div>
        </div>

        {/* Day-journey scroller: 50×62 chips, Day 1 active terra gradient */}
        <div
          className="lg-scroll a-rise d3"
          role="list"
          aria-label="Trip days"
          style={{ display: 'flex', gap: 8, marginTop: 20, overflowX: 'auto', paddingBottom: 2 }}
        >
          {Array.from({ length: Math.min(trip.days, 30) }, (_, i) => {
            const dayNum  = i + 1;
            const isActive = dayNum === currentDisplayDay;
            return (
              <button
                key={dayNum}
                role="listitem"
                onClick={() => handleDayClick(dayNum)}
                aria-label={`${t('day')} ${dayNum}`}
                aria-pressed={isActive}
                style={{
                  flexShrink: 0, width: 50, height: 62, borderRadius: 16, border: 0, cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))'
                    : 'oklch(100% 0 0 / 12%)',
                  boxShadow: isActive
                    ? 'var(--lg-glow-terra)'
                    : 'inset 0 0 0 1px oklch(100% 0 0 / 14%)',
                  color: '#fff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 1, backdropFilter: 'blur(10px)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {t('day')}
                </span>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, lineHeight: 1 }}>
                  {dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ Main content ════════════════════════════════════════════════ */}
      <div style={{ padding: '0 20px', paddingBottom: 110, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── AI summary card ── */}
        <button
          className="a-rise"
          onClick={() => setScreen('day')}
          style={{
            borderRadius: 'var(--lg-r-card)', padding: 16,
            background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))',
            boxShadow: 'var(--lg-glow-forest)',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            border: 0, textAlign: 'start', width: '100%',
          }}
        >
          <div aria-hidden style={{ position: 'absolute', top: -20, insetInlineEnd: -10, opacity: 0.16, pointerEvents: 'none' }}>
            <Icon name="sparkle" size={90} color="#fff" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Icon name="sparkle" size={16} color="var(--lg-sand)" />
            <span className="eyebrow-lg" style={{ color: 'var(--lg-sand)' }}>
              Trip summary
            </span>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.55, color: '#fff', fontWeight: 500, margin: 0 }}>
            {trip.days} {t('days')} · {totalEvents} events planned
            {trip.countries?.length ? ` · ${trip.countries.join(', ')}` : ''}.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#fff', fontWeight: 600, fontSize: 13 }}>
            See suggestions
            <Icon name="arrow" size={15} color="#fff" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
          </div>
        </button>

        {/* ── Next up ── */}
        {nextEvent && (
          <div>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
              {t('nextEvent') as string || 'Next up'}
            </p>
            <button
              className="lg a-rise d1"
              onClick={() => { setActiveDay(nextEvent.dayNum); setScreen('day'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 15, padding: 16,
                cursor: 'pointer', border: 0, textAlign: 'start',
              }}
            >
              <StampIcon iconKey={CAT_FALLBACK[nextEvent.event.category]} size={56} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow-lg" style={{ color: 'var(--lg-sky)', fontSize: 9 }}>
                  {t('day')} {nextEvent.dayNum}
                  {trip.startDate ? ` · ${fmtDate(trip.startDate, nextEvent.dayNum - 1, locale)}` : ''}
                  {` · ${nextEvent.event.time}`}
                  {nextEvent.event.duration
                    ? ` → ${Math.floor((toMins(nextEvent.event.time) + nextEvent.event.duration) / 60).toString().padStart(2, '0')}:${String((toMins(nextEvent.event.time) + nextEvent.event.duration) % 60).padStart(2, '0')}`
                    : ''}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--lg-ink)',
                  lineHeight: 1.05, marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t(nextEvent.event.name as any)}
                </div>
                {nextEvent.event.location && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={12} color="var(--text-3)" />
                    {nextEvent.event.location}
                  </div>
                )}
              </div>

              <Icon
                name="chevR"
                size={20}
                color="var(--text-3)"
                style={{ flexShrink: 0, transform: isRTL ? 'scaleX(-1)' : 'none' }}
              />
            </button>
          </div>
        )}

        {/* ── Quick stats: Packed · Budget ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Packed */}
          <button
            className="lg a-rise d2"
            onClick={() => setScreen('supplies')}
            style={{
              flex: 1, padding: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              cursor: 'pointer', border: 0,
            }}
            aria-label={`Packed: ${packedPct}%`}
          >
            <Ring pct={packedPct} size={58} color="var(--lg-terra)">{packedPct}%</Ring>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-ink)' }}>
              {t('suppliesLabel') as string || 'Packed'}
            </span>
          </button>

          {/* Budget */}
          <div
            className="lg a-rise d3"
            style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}
          >
            <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 9 }}>
              {t('budgetLabel') as string || 'Budget'}
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--lg-ink)', lineHeight: 1 }}>
              {currSym}{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            {trip.budget ? (
              <>
                <div style={{ height: 6, borderRadius: 3, background: 'oklch(50% 0.02 60 / 14%)', overflow: 'hidden', marginTop: 4 }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.round((totalSpent / trip.budget) * 100))}%`,
                      height: '100%', background: 'var(--lg-terra)', borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)' }}>
                  {t('of') as string || 'of'} {currSym}{trip.budget.toLocaleString()}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* ── Today preview ── */}
        {todayEvs.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: 0 }}>
                {'Today · ' + t('day').toUpperCase() + ' ' + currentDisplayDay}
              </p>
              <button
                onClick={() => handleDayClick(currentDisplayDay)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
                  color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                }}
              >
                {trip.days} {t('days')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayEvs.slice(0, 4).map(ev => (
                <div
                  key={ev.id}
                  className="lg a-rise"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDayClick(currentDisplayDay)}
                  onKeyDown={e => e.key === 'Enter' && handleDayClick(currentDisplayDay)}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, cursor: 'pointer' }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                      color: 'var(--lg-ink)', width: 40, flexShrink: 0,
                    }}
                  >
                    {ev.time}
                  </span>

                  <StampIcon iconKey={CAT_FALLBACK[ev.category]} size={38} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t(ev.name as any)}
                    </div>
                    {ev.location && (
                      <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Icon name="pin" size={12} color="var(--text-3)" />
                        {ev.location}
                      </div>
                    )}
                  </div>

                  {ev.duration > 0 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>
                      {fmtDuration(ev.duration)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
