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
  // Euro zone — full list
  'France': 'EUR', 'Germany': 'EUR', 'Italy': 'EUR', 'Spain': 'EUR',
  'Portugal': 'EUR', 'Netherlands': 'EUR', 'Greece': 'EUR', 'Austria': 'EUR',
  'Belgium': 'EUR', 'Finland': 'EUR', 'Ireland': 'EUR', 'Luxembourg': 'EUR',
  'Slovakia': 'EUR', 'Slovenia': 'EUR', 'Estonia': 'EUR', 'Latvia': 'EUR',
  'Lithuania': 'EUR', 'Cyprus': 'EUR', 'Malta': 'EUR', 'Croatia': 'EUR',
  // GBP
  'United Kingdom': 'GBP', 'UK': 'GBP', 'England': 'GBP', 'Scotland': 'GBP',
  // Asia
  'Japan': 'JPY',
  'Thailand': 'THB',
  'United Arab Emirates': 'AED', 'UAE': 'AED', 'Dubai': 'AED',
  'Turkey': 'TRY',
  'India': 'INR',
  'Singapore': 'SGD',
  'Hong Kong': 'HKD',
  'South Korea': 'KRW', 'Korea': 'KRW',
  'Vietnam': 'VND',
  'Indonesia': 'IDR', 'Bali': 'IDR',
  'Malaysia': 'MYR',
  'Philippines': 'PHP',
  'Sri Lanka': 'LKR',
  'Nepal': 'NPR',
  'China': 'CNY',
  'Taiwan': 'TWD',
  // Americas
  'Mexico': 'MXN',
  'Canada': 'CAD',
  'Australia': 'AUD', 'New Zealand': 'NZD',
  'Brazil': 'BRL',
  'Argentina': 'ARS',
  'Colombia': 'COP',
  'Chile': 'CLP',
  'Peru': 'PEN',
  // Europe non-EUR
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Czech Republic': 'CZK', 'Czechia': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON',
  'Iceland': 'ISK',
  // Middle East & Africa
  'Israel': 'ILS',
  'Jordan': 'JOD',
  'Egypt': 'EGP',
  'Morocco': 'MAD',
  'South Africa': 'ZAR',
  'Kenya': 'KES',
  'Saudi Arabia': 'SAR',
  'Qatar': 'QAR',
  // Default
  'United States': 'USD', 'USA': 'USD',
};

export function getCountryCurrency(country: string): string {
  return COUNTRY_CURRENCY[country] ?? 'USD';
}

let rateCache: { base: string; rates: Record<string, number>; ts: number } | null = null;
const CACHE_TTL = 3_600_000; // 1 hour — mirrors server-side revalidate window

export async function getExchangeRates(base: string): Promise<Record<string, number>> {
  const now = Date.now();
  if (rateCache && rateCache.base === base && now - rateCache.ts < CACHE_TTL) {
    return rateCache.rates;
  }
  try {
    // Route through our own server proxy — keeps external API calls server-side only
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const res = await fetch(`${origin}/api/exchange-rates?base=${base}`);
    if (!res.ok) return {};
    const rates = await res.json() as Record<string, number>;
    rateCache = { base, rates, ts: now };
    return rates;
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
