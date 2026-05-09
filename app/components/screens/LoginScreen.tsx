'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassBtn from '../ui/GlassBtn';
import Field from '../ui/Field';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import { useAppStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { useI18n } from '@/lib/i18n';
import { TripTheme } from '@/lib/types';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, type: 'spring' as const, stiffness: 340, damping: 32 },
  }),
};

const THEMES: { id: TripTheme; emoji: string; label: string; labelHe: string }[] = [
  { id: 'desert', emoji: '🏜️', label: 'Desert', labelHe: 'מדבר' },
  { id: 'nature', emoji: '🌲', label: 'Nature', labelHe: 'טבע'  },
  { id: 'city',   emoji: '🌆', label: 'City',   labelHe: 'עיר'  },
  { id: 'beach',  emoji: '🏖️', label: 'Beach',  labelHe: 'חוף'  },
];

export default function LoginScreen() {
  const { joinTrip, createTrip } = useAppStore();
  const { show } = useToast();
  const { t, locale } = useI18n();

  const [tripName, setTripName] = useState('');
  const [tripCode, setTripCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [cName,  setCName]  = useState('');
  const [cDays,  setCDays]  = useState('3');
  const [cCode,  setCCode]  = useState('');
  const [cCode2, setCCode2] = useState('');
  const [cNick,  setCNick]  = useState('');
  const [cTheme, setCTheme] = useState<TripTheme>('desert');
  const [cDate,  setCDate]  = useState(new Date().toISOString().split('T')[0]);

  const handleJoin = () => {
    if (!tripName.trim() || !tripCode.trim()) { show(t('enterTripNameCode')); return; }
    if (!nickname.trim())                     { show(t('enterNickname'));      return; }
    const ok = joinTrip(tripName, tripCode, nickname);
    if (!ok) show(t('tripNotFound'));
  };

  const handleCreate = () => {
    if (!cName.trim())    { show(t('enterTripName'));  return; }
    if (!cNick.trim())    { show(t('enterNickname'));  return; }
    if (cCode.length > 0 && cCode.length < 6) { show(t('codeTooShort')); return; }
    if (cCode && cCode !== cCode2) { show(t('codesNoMatch')); return; }
    const days = Math.min(30, Math.max(1, parseInt(cDays, 10) || 3));
    createTrip(cName, days, cCode, cNick, cTheme, cDate);
  };

  const selectedTheme = THEMES.find(th => th.id === cTheme) ?? THEMES[0];

  return (
    <div className="flex h-full items-center justify-center px-6 overflow-y-auto w-full">
      <div style={{ width: '100%', maxWidth: 440, paddingTop: 32, paddingBottom: 32 }}>

        {/* Logo */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: 32, textAlign: 'center' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12, lineHeight: 1 }}>🌍</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--brand)',
            lineHeight: 1.05,
            marginBottom: 8,
          }}>
            {t('appName')}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 400, lineHeight: 1.5 }}>
            {t('appTagline')}
          </p>
        </motion.div>

        {/* Join card */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: 10 }}
        >
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
          }}>
            <h2 style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 16,
              letterSpacing: '-0.01em',
            }}>
              {t('joinTrip')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field
                label={t('tripName')}
                placeholder="e.g. Negev Desert Adventure"
                value={tripName}
                onChange={setTripName}
                icon={<Icon name="tent" size={15} />}
              />
              <Field
                label={t('tripCode')}
                type="password"
                placeholder="Shared code"
                value={tripCode}
                onChange={setTripCode}
                icon={<Icon name="lock" size={15} />}
              />
              <Field
                label={t('yourNickname')}
                placeholder="e.g. Dana"
                value={nickname}
                onChange={setNickname}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                icon={<Icon name="user" size={15} />}
              />
              <GlassBtn variant="accent" size="lg" onClick={handleJoin} style={{ width: '100%', marginTop: 4 }}>
                <Icon name="arrow" size={15} /> {t('joinBtn')}
              </GlassBtn>
            </div>
          </div>
        </motion.div>

        {/* Demo */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: 8 }}
        >
          <GlassBtn
            onClick={() => {
              setTripName('Negev Desert Adventure');
              setTripCode('desert123');
              setNickname('Traveler');
            }}
            style={{ width: '100%' }}
          >
            ✨ {t('tryDemo')}
          </GlassBtn>
        </motion.div>

        {/* Create trip */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassBtn onClick={() => setShowCreate(true)} style={{ width: '100%' }}>
            <Icon name="plus" size={15} /> {t('createNewTrip')}
          </GlassBtn>
        </motion.div>

        {/* Create trip sheet */}
        {showCreate && (
          <Sheet
            onClose={() => setShowCreate(false)}
            title={t('createNewTrip')}
            subtitle={`${selectedTheme.emoji} ${locale === 'he' ? selectedTheme.labelHe : selectedTheme.label}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-2)', marginBottom: 10,
                }}>
                  {locale === 'he' ? 'בחר רקע' : 'Background'}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {THEMES.map(th => (
                    <motion.button
                      key={th.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setCTheme(th.id)}
                      style={{
                        flex: 1,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 4,
                        padding: '10px 4px', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: cTheme === th.id ? 'var(--brand-light)' : 'var(--bg)',
                        border: cTheme === th.id ? '2px solid var(--brand)' : '1px solid var(--border)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{th.emoji}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: cTheme === th.id ? 'var(--brand)' : 'var(--text-2)',
                      }}>
                        {locale === 'he' ? th.labelHe : th.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Field label={t('tripName')} placeholder="e.g. Europe Adventure 2026" value={cName} onChange={setCName} icon={<Icon name="tent" size={15} />} />
              <Field label={t('yourNickname')} placeholder="e.g. Alex" value={cNick} onChange={setCNick} icon={<Icon name="user" size={15} />} />
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label={t('numDays')} type="number" placeholder="10" value={cDays} onChange={setCDays} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Start date
                  </label>
                  <input
                    type="date"
                    value={cDate}
                    onChange={e => setCDate(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                      fontSize: 14, fontWeight: 500,
                      background: 'var(--bg)', color: 'var(--text)',
                      border: '1px solid var(--border)', outline: 'none',
                      boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
              </div>
              <Field label={`${t('chooseCode')} (optional)`} type="password" placeholder="Leave blank for personal trip" value={cCode} onChange={setCCode} icon={<Icon name="lock" size={15} />} />
              {cCode.length > 0 && (
                <Field label={t('confirmCode')} type="password" placeholder="Repeat code" value={cCode2} onChange={setCCode2} />
              )}
              <GlassBtn variant="accent" size="lg" onClick={handleCreate} style={{ width: '100%', marginTop: 4 }}>
                <Icon name="check" size={15} /> {t('createBtn')}
              </GlassBtn>
            </div>
          </Sheet>
        )}
      </div>
    </div>
  );
}
