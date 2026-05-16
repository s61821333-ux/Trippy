// Currency utilities — uses open.er-api.com (free, no API key needed)

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  labelHe: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$',  label: 'US Dollar',     labelHe: 'דולר אמריקאי' },
  { code: 'EUR', symbol: '€',  label: 'Euro',           labelHe: 'יורו' },
  { code: 'ILS', symbol: '₪',  label: 'Israeli Shekel', labelHe: 'שקל' },
  { code: 'GBP', symbol: '£',  label: 'British Pound',  labelHe: 'פאונד בריטי' },
  { code: 'JPY', symbol: '¥',  label: 'Japanese Yen',   labelHe: 'ין יפני' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', labelHe: 'דולר קנדי' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', labelHe: 'דולר אוסטרלי' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc',    labelHe: 'פרנק שוויצרי' },
  { code: 'THB', symbol: '฿',  label: 'Thai Baht',      labelHe: 'באהט תאילנדי' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham',    labelHe: 'דירהם אמירויות' },
  { code: 'TRY', symbol: '₺',  label: 'Turkish Lira',   labelHe: 'לירה טורקית' },
  { code: 'INR', symbol: '₹',  label: 'Indian Rupee',   labelHe: 'רופי הודי' },
  { code: 'MXN', symbol: 'M$', label: 'Mexican Peso',   labelHe: 'פסו מקסיקני' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', labelHe: 'דולר סינגפורי' },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}

// Maps ISO 3166 country name → local currency code
const COUNTRY_CURRENCY: Record<string, string> = {
  'France': 'EUR', 'Germany': 'EUR', 'Italy': 'EUR', 'Spain': 'EUR',
  'Portugal': 'EUR', 'Netherlands': 'EUR', 'Greece': 'EUR', 'Austria': 'EUR',
  'Belgium': 'EUR', 'Finland': 'EUR', 'Ireland': 'EUR',
  'United Kingdom': 'GBP', 'UK': 'GBP',
  'Japan': 'JPY',
  'Thailand': 'THB',
  'United Arab Emirates': 'AED', 'UAE': 'AED', 'Dubai': 'AED',
  'Turkey': 'TRY',
  'India': 'INR',
  'Mexico': 'MXN',
  'Switzerland': 'CHF',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Singapore': 'SGD',
  'Israel': 'ILS',
  'United States': 'USD', 'USA': 'USD',
};

export function getCountryCurrency(country: string): string {
  return COUNTRY_CURRENCY[country] ?? 'USD';
}

let rateCache: { base: string; rates: Record<string, number>; ts: number } | null = null;
const CACHE_TTL = 3_600_000; // 1 hour

export async function getExchangeRates(base: string): Promise<Record<string, number>> {
  const now = Date.now();
  if (rateCache && rateCache.base === base && now - rateCache.ts < CACHE_TTL) {
    return rateCache.rates;
  }
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    if (data.result !== 'success') return {};
    rateCache = { base, rates: data.rates, ts: now };
    return data.rates;
  } catch {
    return {};
  }
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number | null> {
  if (from === to) return amount;
  const rates = await getExchangeRates(from);
  const rate = rates[to];
  if (!rate) return null;
  return Math.round(amount * rate * 100) / 100;
}
