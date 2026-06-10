/**
 * Shared date formatting helpers — use these everywhere instead of inline
 * toLocaleDateString('en-US') calls. All functions accept a locale string
 * ('en' | 'he') and resolve to the correct BCP-47 locale for formatting.
 */

function bcp47(locale: string): string {
  return locale === 'he' ? 'he-IL' : 'en-US';
}

/**
 * Format a date range from a start date + number of days.
 * Returns "Mar 4 – Mar 10" (en) or "4 במרץ – 10 במרץ" (he).
 * Uses an en-dash (–) which is direction-neutral, never an arrow.
 */
export function formatDateRange(
  startDate: string | null,
  days: number,
  locale: string = 'en',
): string {
  if (!startDate) return `${days} ${locale === 'he' ? 'ימים' : 'days'}`;
  const start = new Date(startDate + 'T00:00:00');
  const end   = new Date(startDate + 'T00:00:00');
  end.setDate(end.getDate() + days - 1);
  const lc  = bcp47(locale);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(lc, opts)} – ${end.toLocaleDateString(lc, opts)}`;
}

/**
 * Format a single date with weekday, month and day for day-pill labels.
 */
export function formatDayLabel(
  startDate: string | undefined,
  dayNum: number,
  locale: string = 'en',
): string {
  if (!startDate) return `${locale === 'he' ? 'יום' : 'Day'} ${dayNum}`;
  const dt = new Date(
    new Date(startDate + 'T00:00:00').getTime() + (dayNum - 1) * 86_400_000,
  );
  return dt.toLocaleDateString(bcp47(locale), {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}
