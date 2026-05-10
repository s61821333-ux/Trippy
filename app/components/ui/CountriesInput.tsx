'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Full list: [English name, Hebrew name, flag emoji]
const ALL_COUNTRIES: [string, string, string][] = [
  ['Israel',           'ישראל',        '🇮🇱'],
  ['United States',    'ארצות הברית',  '🇺🇸'],
  ['France',           'צרפת',         '🇫🇷'],
  ['Germany',          'גרמניה',       '🇩🇪'],
  ['Italy',            'איטליה',       '🇮🇹'],
  ['Spain',            'ספרד',         '🇪🇸'],
  ['Portugal',         'פורטוגל',      '🇵🇹'],
  ['Greece',           'יוון',         '🇬🇷'],
  ['United Kingdom',   'בריטניה',      '🇬🇧'],
  ['Netherlands',      'הולנד',        '🇳🇱'],
  ['Belgium',          'בלגיה',        '🇧🇪'],
  ['Switzerland',      'שוויץ',        '🇨🇭'],
  ['Austria',          'אוסטריה',      '🇦🇹'],
  ['Sweden',           'שוודיה',       '🇸🇪'],
  ['Norway',           'נורווגיה',     '🇳🇴'],
  ['Denmark',          'דנמרק',        '🇩🇰'],
  ['Finland',          'פינלנד',       '🇫🇮'],
  ['Ireland',          'אירלנד',       '🇮🇪'],
  ['Poland',           'פולין',        '🇵🇱'],
  ['Czech Republic',   'צ\'כיה',       '🇨🇿'],
  ['Hungary',          'הונגריה',      '🇭🇺'],
  ['Romania',          'רומניה',       '🇷🇴'],
  ['Croatia',          'קרואטיה',      '🇭🇷'],
  ['Turkey',           'טורקיה',       '🇹🇷'],
  ['Egypt',            'מצרים',        '🇪🇬'],
  ['Jordan',           'ירדן',         '🇯🇴'],
  ['UAE',              'איחוד האמירויות', '🇦🇪'],
  ['Morocco',          'מרוקו',        '🇲🇦'],
  ['Japan',            'יפן',          '🇯🇵'],
  ['China',            'סין',          '🇨🇳'],
  ['India',            'הודו',         '🇮🇳'],
  ['Thailand',         'תאילנד',       '🇹🇭'],
  ['Vietnam',          'וייטנאם',      '🇻🇳'],
  ['Indonesia',        'אינדונזיה',    '🇮🇩'],
  ['Malaysia',         'מלזיה',        '🇲🇾'],
  ['Singapore',        'סינגפור',      '🇸🇬'],
  ['South Korea',      'דרום קוריאה',  '🇰🇷'],
  ['Australia',        'אוסטרליה',     '🇦🇺'],
  ['New Zealand',      'ניו זילנד',    '🇳🇿'],
  ['Canada',           'קנדה',         '🇨🇦'],
  ['Mexico',           'מקסיקו',       '🇲🇽'],
  ['Brazil',           'ברזיל',        '🇧🇷'],
  ['Argentina',        'ארגנטינה',     '🇦🇷'],
  ['Colombia',         'קולומביה',     '🇨🇴'],
  ['Peru',             'פרו',          '🇵🇪'],
  ['Chile',            'צ\'ילה',       '🇨🇱'],
  ['South Africa',     'דרום אפריקה',  '🇿🇦'],
  ['Kenya',            'קניה',         '🇰🇪'],
  ['Tanzania',         'טנזניה',       '🇹🇿'],
  ['Ethiopia',         'אתיופיה',      '🇪🇹'],
  ['Iceland',          'איסלנד',       '🇮🇸'],
  ['Russia',           'רוסיה',        '🇷🇺'],
  ['Ukraine',          'אוקראינה',     '🇺🇦'],
  ['Georgia',          'גאורגיה',      '🇬🇪'],
  ['Armenia',          'ארמניה',       '🇦🇲'],
  ['Azerbaijan',       'אזרבייג\'אן',  '🇦🇿'],
  ['Cyprus',           'קפריסין',      '🇨🇾'],
  ['Malta',            'מלטה',         '🇲🇹'],
  ['Slovakia',         'סלובקיה',      '🇸🇰'],
  ['Slovenia',         'סלובניה',      '🇸🇮'],
  ['Serbia',           'סרביה',        '🇷🇸'],
  ['Bulgaria',         'בולגריה',      '🇧🇬'],
  ['Albania',          'אלבניה',       '🇦🇱'],
  ['North Macedonia',  'מקדוניה',      '🇲🇰'],
  ['Bosnia',           'בוסניה',       '🇧🇦'],
  ['Montenegro',       'מונטנגרו',     '🇲🇪'],
  ['Kosovo',           'קוסובו',       '🇽🇰'],
  ['Luxembourg',       'לוקסמבורג',    '🇱🇺'],
  ['Estonia',          'אסטוניה',      '🇪🇪'],
  ['Latvia',           'לטביה',        '🇱🇻'],
  ['Lithuania',        'ליטא',         '🇱🇹'],
  ['Belarus',          'בלרוס',        '🇧🇾'],
  ['Moldova',          'מולדובה',      '🇲🇩'],
  ['Philippines',      'פיליפינים',    '🇵🇭'],
  ['Cambodia',         'קמבודיה',      '🇰🇭'],
  ['Myanmar',          'מיאנמר',       '🇲🇲'],
  ['Nepal',            'נפאל',         '🇳🇵'],
  ['Sri Lanka',        'סרי לנקה',     '🇱🇰'],
  ['Maldives',         'מלדיביים',     '🇲🇻'],
  ['Pakistan',         'פקיסטן',       '🇵🇰'],
  ['Iran',             'איראן',        '🇮🇷'],
  ['Iraq',             'עיראק',        '🇮🇶'],
  ['Saudi Arabia',     'ערב הסעודית',  '🇸🇦'],
  ['Kuwait',           'כווית',        '🇰🇼'],
  ['Qatar',            'קטאר',         '🇶🇦'],
  ['Bahrain',          'בחריין',       '🇧🇭'],
  ['Oman',             'עומאן',        '🇴🇲'],
  ['Lebanon',          'לבנון',        '🇱🇧'],
  ['Tunisia',          'תוניסיה',      '🇹🇳'],
  ['Algeria',          'אלג\'יריה',    '🇩🇿'],
  ['Libya',            'לוב',          '🇱🇾'],
  ['Sudan',            'סודן',         '🇸🇩'],
  ['Ghana',            'גאנה',         '🇬🇭'],
  ['Nigeria',          'ניגריה',       '🇳🇬'],
  ['Senegal',          'סנגל',         '🇸🇳'],
  ['Madagascar',       'מדגסקר',       '🇲🇬'],
  ['Mauritius',        'מאוריציוס',    '🇲🇺'],
  ['Seychelles',       'איי שייכל',    '🇸🇨'],
  ['Cuba',             'קובה',         '🇨🇺'],
  ['Jamaica',          'ג\'מייקה',     '🇯🇲'],
  ['Dominican Rep.',   'הרפובליקה הדומיניקנית', '🇩🇴'],
  ['Costa Rica',       'קוסטה ריקה',   '🇨🇷'],
  ['Panama',           'פנמה',         '🇵🇦'],
  ['Ecuador',          'אקוודור',      '🇪🇨'],
  ['Bolivia',          'בוליביה',      '🇧🇴'],
  ['Uruguay',          'אורוגוואי',    '🇺🇾'],
  ['Paraguay',         'פרגוואי',      '🇵🇾'],
  ['Venezuela',        'ונצואלה',      '🇻🇪'],
];

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
  label?: string;
}

export default function CountriesInput({ value, onChange, label }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim().length === 0
    ? []
    : ALL_COUNTRIES.filter(([en, he]) => {
        const q = query.toLowerCase();
        return (en.toLowerCase().includes(q) || he.includes(query)) &&
               !value.includes(en);
      }).slice(0, 7);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (name: string) => {
    if (!value.includes(name)) onChange([...value, name]);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (name: string) => onChange(value.filter(v => v !== name));

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
          {label}
        </label>
      )}

      {/* Input area */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          minHeight: 44, padding: '6px 12px',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', cursor: 'text',
          transition: 'border-color 0.15s',
        }}
      >
        {/* Chips */}
        {value.map(name => {
          const entry = ALL_COUNTRIES.find(([en]) => en === name);
          return (
            <motion.span
              key={name}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--brand-light)', color: 'var(--brand)',
                borderRadius: 999, padding: '3px 10px 3px 8px',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 15 }}>{entry?.[2]}</span>
              {name}
              <button
                onMouseDown={e => { e.preventDefault(); remove(name); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--brand)', fontSize: 14, padding: '0 0 0 2px',
                  lineHeight: 1, display: 'flex', alignItems: 'center',
                }}
              >
                ×
              </button>
            </motion.span>
          );
        })}

        {/* Text input */}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? 'ישראל, צרפת, יפן…' : ''}
          style={{
            flex: 1, minWidth: 100, border: 'none', outline: 'none',
            background: 'transparent', fontSize: 14, fontWeight: 500,
            color: 'var(--text)', padding: '2px 0',
          }}
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.92 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              zIndex: 100, marginTop: 4,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
              overflow: 'hidden', transformOrigin: 'top',
            }}
          >
            {filtered.map(([en, he, flag]) => (
              <button
                key={en}
                onMouseDown={e => { e.preventDefault(); add(en); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 20 }}>{flag}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{en}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)', marginRight: 'auto' }}>{he}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
