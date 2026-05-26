// Bundled country → primary IANA timezone fallback.
// Used when event coords are unavailable (avoids API call on the hero card).
// Google Time Zone API is the authoritative source when lat/lng is known.
const COUNTRY_TZ: Record<string, string> = {
  // Europe
  'France': 'Europe/Paris',
  'Italy': 'Europe/Rome',
  'Spain': 'Europe/Madrid',
  'Germany': 'Europe/Berlin',
  'United Kingdom': 'Europe/London',
  'UK': 'Europe/London',
  'Portugal': 'Europe/Lisbon',
  'Netherlands': 'Europe/Amsterdam',
  'Belgium': 'Europe/Brussels',
  'Switzerland': 'Europe/Zurich',
  'Austria': 'Europe/Vienna',
  'Greece': 'Europe/Athens',
  'Poland': 'Europe/Warsaw',
  'Czech Republic': 'Europe/Prague',
  'Hungary': 'Europe/Budapest',
  'Romania': 'Europe/Bucharest',
  'Sweden': 'Europe/Stockholm',
  'Norway': 'Europe/Oslo',
  'Denmark': 'Europe/Copenhagen',
  'Finland': 'Europe/Helsinki',
  'Russia': 'Europe/Moscow',
  'Ukraine': 'Europe/Kiev',
  'Croatia': 'Europe/Zagreb',
  'Serbia': 'Europe/Belgrade',
  'Turkey': 'Europe/Istanbul',
  // Middle East
  'Israel': 'Asia/Jerusalem',
  'Jordan': 'Asia/Amman',
  'UAE': 'Asia/Dubai',
  'United Arab Emirates': 'Asia/Dubai',
  'Saudi Arabia': 'Asia/Riyadh',
  'Egypt': 'Africa/Cairo',
  'Lebanon': 'Asia/Beirut',
  // Asia-Pacific
  'Japan': 'Asia/Tokyo',
  'China': 'Asia/Shanghai',
  'India': 'Asia/Kolkata',
  'Thailand': 'Asia/Bangkok',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'Singapore': 'Asia/Singapore',
  'Indonesia': 'Asia/Jakarta',
  'South Korea': 'Asia/Seoul',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Australia': 'Australia/Sydney',
  'New Zealand': 'Pacific/Auckland',
  'Philippines': 'Asia/Manila',
  // Americas
  'USA': 'America/New_York',
  'United States': 'America/New_York',
  'Canada': 'America/Toronto',
  'Mexico': 'America/Mexico_City',
  'Brazil': 'America/Sao_Paulo',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Colombia': 'America/Bogota',
  'Peru': 'America/Lima',
  'Chile': 'America/Santiago',
  // Africa
  'South Africa': 'Africa/Johannesburg',
  'Morocco': 'Africa/Casablanca',
  'Kenya': 'Africa/Nairobi',
  'Nigeria': 'Africa/Lagos',
  'Ethiopia': 'Africa/Addis_Ababa',
};

export function getTimezoneForCountry(country: string): string | null {
  return COUNTRY_TZ[country] ?? null;
}
