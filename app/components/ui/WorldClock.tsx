'use client';
import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

interface WorldClockProps {
  destinationTimezone: string;  // IANA: "Europe/Rome"
  destinationCity: string;      // "Rome"
}

function getTimezoneOffsetHours(tz1: string, tz2: string, date: Date): number {
  const getOffset = (tz: string): number => {
    try {
      const str = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      }).formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? 'UTC+0';
      const match = str.match(/([+-])(\d+)(?::(\d+))?/);
      if (!match) return 0;
      const sign = match[1] === '+' ? 1 : -1;
      return sign * (parseInt(match[2]) + (parseInt(match[3] ?? '0') / 60));
    } catch {
      return 0;
    }
  };
  return Math.round(getOffset(tz1) - getOffset(tz2));
}

export function WorldClock({ destinationTimezone, destinationCity }: WorldClockProps) {
  const [now, setNow] = useState<Date | null>(null);
  const { t, locale } = useI18n();

  // Hydrate on client only to avoid SSR mismatch
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const fmt = (tz: string) => {
    try {
      return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: tz,
        hour12: false,
      }).format(now);
    } catch {
      return '--:--';
    }
  };

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let destTime = '--:--';
  let localTime = '--:--';
  let offsetH = 0;
  try {
    destTime = fmt(destinationTimezone);
    localTime = fmt(localTz);
    offsetH = getTimezoneOffsetHours(destinationTimezone, localTz, now);
  } catch {
    // invalid timezone - don't crash
  }

  const offsetLabel =
    offsetH === 0
      ? (t('worldClock.sameZone') as string)
      : offsetH > 0
        ? (t('worldClock.ahead') as string).replace('{h}', String(offsetH))
        : (t('worldClock.behind') as string).replace('{h}', String(Math.abs(offsetH)));

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
    }}>
      {/* Destination row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>🕐</span>
        <span style={{
          flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {destinationCity}
        </span>
        <span style={{
          fontSize: 14, fontWeight: 800, color: 'var(--text)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
        }}>
          {destTime}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, color: 'var(--terra)',
          background: 'var(--terra-muted)',
          borderRadius: 100, padding: '2px 7px',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {t('worldClock.nowHere') as string}
        </span>
      </div>

      {/* Home row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>🏠</span>
        <span style={{
          flex: 1, fontSize: 12, fontWeight: 500, color: 'var(--text-2)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {t('worldClock.yourTime') as string}
        </span>
        <span style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
        }}>
          {localTime}
        </span>
        {offsetH !== 0 && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            ({offsetLabel})
          </span>
        )}
      </div>
    </div>
  );
}
