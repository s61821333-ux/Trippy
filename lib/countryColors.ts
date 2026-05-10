export interface CountryColors {
  name: string;
  flag: string;
  colors: string[];
}

const COUNTRY_MAP: Record<string, CountryColors> = {
  israel:        { name: 'Israel',        flag: '🇮🇱', colors: ['#0038b8', '#ffffff', '#0038b8'] },
  usa:           { name: 'USA',           flag: '🇺🇸', colors: ['#B22234', '#ffffff', '#3C3B6E'] },
  'united states': { name: 'United States', flag: '🇺🇸', colors: ['#B22234', '#ffffff', '#3C3B6E'] },
  france:        { name: 'France',        flag: '🇫🇷', colors: ['#002395', '#ffffff', '#ED2939'] },
  japan:         { name: 'Japan',         flag: '🇯🇵', colors: ['#ffffff', '#BC002D', '#ffffff'] },
  italy:         { name: 'Italy',         flag: '🇮🇹', colors: ['#009246', '#ffffff', '#CE2B37'] },
  greece:        { name: 'Greece',        flag: '🇬🇷', colors: ['#0D5EAF', '#ffffff', '#0D5EAF'] },
  spain:         { name: 'Spain',         flag: '🇪🇸', colors: ['#AA151B', '#F1BF00', '#AA151B'] },
  germany:       { name: 'Germany',       flag: '🇩🇪', colors: ['#000000', '#DD0000', '#FFCE00'] },
  brazil:        { name: 'Brazil',        flag: '🇧🇷', colors: ['#009c3b', '#FFDF00', '#002776'] },
  india:         { name: 'India',         flag: '🇮🇳', colors: ['#FF9933', '#ffffff', '#138808'] },
  thailand:      { name: 'Thailand',      flag: '🇹🇭', colors: ['#A51931', '#ffffff', '#2D2A4A'] },
  portugal:      { name: 'Portugal',      flag: '🇵🇹', colors: ['#006600', '#FF0000', '#FFD700'] },
  mexico:        { name: 'Mexico',        flag: '🇲🇽', colors: ['#006847', '#ffffff', '#CE1126'] },
  netherlands:   { name: 'Netherlands',   flag: '🇳🇱', colors: ['#AE1C28', '#ffffff', '#21468B'] },
  turkey:        { name: 'Turkey',        flag: '🇹🇷', colors: ['#E30A17', '#ffffff', '#E30A17'] },
  egypt:         { name: 'Egypt',         flag: '🇪🇬', colors: ['#CE1126', '#ffffff', '#000000'] },
  jordan:        { name: 'Jordan',        flag: '🇯🇴', colors: ['#007A3D', '#ffffff', '#CE1126'] },
  uk:            { name: 'UK',            flag: '🇬🇧', colors: ['#012169', '#ffffff', '#C8102E'] },
  'united kingdom': { name: 'United Kingdom', flag: '🇬🇧', colors: ['#012169', '#ffffff', '#C8102E'] },
  england:       { name: 'England',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', colors: ['#ffffff', '#CF142B', '#ffffff'] },
  switzerland:   { name: 'Switzerland',   flag: '🇨🇭', colors: ['#FF0000', '#ffffff', '#FF0000'] },
  austria:       { name: 'Austria',       flag: '🇦🇹', colors: ['#ED2939', '#ffffff', '#ED2939'] },
  australia:     { name: 'Australia',     flag: '🇦🇺', colors: ['#00008B', '#ffffff', '#FF0000'] },
  canada:        { name: 'Canada',        flag: '🇨🇦', colors: ['#FF0000', '#ffffff', '#FF0000'] },
  china:         { name: 'China',         flag: '🇨🇳', colors: ['#DE2910', '#FFDE00', '#DE2910'] },
  southkorea:    { name: 'South Korea',   flag: '🇰🇷', colors: ['#ffffff', '#003478', '#CD2E3A'] },
  'south korea': { name: 'South Korea',   flag: '🇰🇷', colors: ['#ffffff', '#003478', '#CD2E3A'] },
  argentina:     { name: 'Argentina',     flag: '🇦🇷', colors: ['#74ACDF', '#ffffff', '#74ACDF'] },
  colombia:      { name: 'Colombia',      flag: '🇨🇴', colors: ['#FCD116', '#003087', '#CE1126'] },
  peru:          { name: 'Peru',          flag: '🇵🇪', colors: ['#D91023', '#ffffff', '#D91023'] },
  morocco:       { name: 'Morocco',       flag: '🇲🇦', colors: ['#C1272D', '#006233', '#C1272D'] },
  uae:           { name: 'UAE',           flag: '🇦🇪', colors: ['#00732F', '#ffffff', '#FF0000'] },
  'united arab emirates': { name: 'UAE', flag: '🇦🇪', colors: ['#00732F', '#ffffff', '#FF0000'] },
  czech:         { name: 'Czech Republic',flag: '🇨🇿', colors: ['#D7141A', '#ffffff', '#11457E'] },
  'czech republic': { name: 'Czech Republic', flag: '🇨🇿', colors: ['#D7141A', '#ffffff', '#11457E'] },
  hungary:       { name: 'Hungary',       flag: '🇭🇺', colors: ['#CE2939', '#ffffff', '#477050'] },
  poland:        { name: 'Poland',        flag: '🇵🇱', colors: ['#ffffff', '#DC143C', '#ffffff'] },
  sweden:        { name: 'Sweden',        flag: '🇸🇪', colors: ['#006AA7', '#FECC02', '#006AA7'] },
  norway:        { name: 'Norway',        flag: '🇳🇴', colors: ['#EF2B2D', '#ffffff', '#002868'] },
  denmark:       { name: 'Denmark',       flag: '🇩🇰', colors: ['#C60C30', '#ffffff', '#C60C30'] },
  finland:       { name: 'Finland',       flag: '🇫🇮', colors: ['#ffffff', '#003580', '#ffffff'] },
  iceland:       { name: 'Iceland',       flag: '🇮🇸', colors: ['#003897', '#ffffff', '#D72828'] },
  ireland:       { name: 'Ireland',       flag: '🇮🇪', colors: ['#169B62', '#ffffff', '#FF883E'] },
  belgium:       { name: 'Belgium',       flag: '🇧🇪', colors: ['#000000', '#FAE042', '#EF3340'] },
  singapore:     { name: 'Singapore',     flag: '🇸🇬', colors: ['#EF3340', '#ffffff', '#EF3340'] },
  vietnam:       { name: 'Vietnam',       flag: '🇻🇳', colors: ['#DA251D', '#FFCD00', '#DA251D'] },
  indonesia:     { name: 'Indonesia',     flag: '🇮🇩', colors: ['#CE1126', '#ffffff', '#CE1126'] },
  malaysia:      { name: 'Malaysia',      flag: '🇲🇾', colors: ['#CC0001', '#ffffff', '#006EB1'] },
  philippines:   { name: 'Philippines',   flag: '🇵🇭', colors: ['#0038A8', '#ffffff', '#CE1126'] },
  newzealand:    { name: 'New Zealand',   flag: '🇳🇿', colors: ['#00247D', '#ffffff', '#CC142B'] },
  'new zealand': { name: 'New Zealand',   flag: '🇳🇿', colors: ['#00247D', '#ffffff', '#CC142B'] },
}

const DEFAULT_COLORS = ['#2a4a7f', '#e8a020', '#2a4a7f']

export function getCountryColors(countries: string[]): { colors: string[]; flags: string[]; names: string[] } {
  const allColors: string[] = []
  const flags: string[] = []
  const names: string[] = []

  for (const raw of countries) {
    const key = raw.toLowerCase().trim()
    const entry = COUNTRY_MAP[key]
    if (entry) {
      allColors.push(...entry.colors)
      flags.push(entry.flag)
      names.push(entry.name)
    }
  }

  if (allColors.length === 0) {
    return { colors: DEFAULT_COLORS, flags: ['🌍'], names: countries }
  }

  // De-duplicate adjacent identical colors
  const deduped = allColors.filter((c, i) => i === 0 || c !== allColors[i - 1])
  return { colors: deduped, flags, names }
}
