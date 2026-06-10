'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../ui/Toast';
import CompassMark from '../ui/CompassMark';
import Icon from '../ui/Icon';
import Btn from '../ui/Btn';
import Field from '../ui/Field';
import { Participant } from '@/lib/types';

// ── Avatar ────────────────────────────────────────────────────────────────────

const AVC = [
  'var(--avatar-1)', 'var(--avatar-2)', 'var(--avatar-3)',
  'var(--avatar-4)', 'var(--avatar-5)', 'var(--avatar-6)',
];

function Avatar({ name, index = 0, size = 44 }: { name: string; index?: number; size?: number }) {
  const initials = (name || '?').trim().split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      aria-label={name}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: AVC[index % AVC.length], color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.36,
        letterSpacing: '-0.02em',
      }}
    >
      {initials || '?'}
    </div>
  );
}

// ── Crew_V2 ───────────────────────────────────────────────────────────────────

export default function Crew_V2() {
  const { t, locale } = useI18n();
  const { show } = useToast();

  const { trip, nickname, inviteToTrip, createInviteLink, pendingInvitations, loadInvitations, acceptInvitation, rejectInvitation } = useAppStore(
    useShallow(s => ({
      trip:               s.trip,
      nickname:           s.nickname,
      inviteToTrip:       s.inviteToTrip,
      createInviteLink:   s.createInviteLink,
      pendingInvitations: s.pendingInvitations,
      loadInvitations:    s.loadInvitations,
      acceptInvitation:   s.acceptInvitation,
      rejectInvitation:   s.rejectInvitation,
    }))
  );

  const [email,       setEmail]       = useState('');
  const [sending,     setSending]     = useState(false);
  const [inviteLink,  setInviteLink]  = useState('');
  const [copying,     setCopying]     = useState(false);

  React.useEffect(() => { loadInvitations().catch(() => {}); }, []);

  if (!trip) return null;

  const participants = trip.participants ?? [];

  const handleSendInvite = async () => {
    if (!email.trim()) { show(locale === 'he' ? 'הזן כתובת מייל' : 'Enter an email address'); return; }
    setSending(true);
    try {
      await inviteToTrip(email.trim());
      show(locale === 'he' ? 'ההזמנה נשלחה ✓' : 'Invitation sent ✓');
      setEmail('');
    } catch {
      show(locale === 'he' ? 'לא ניתן לשלוח' : 'Could not send invitation');
    }
    setSending(false);
  };

  const handleGetLink = async () => {
    if (inviteLink) {
      navigator.clipboard?.writeText(inviteLink).catch(() => {});
      show(locale === 'he' ? 'הועתק ✓' : 'Copied ✓');
      return;
    }
    setCopying(true);
    try {
      const link = await createInviteLink();
      setInviteLink(link);
      navigator.clipboard?.writeText(link).catch(() => {});
      show(locale === 'he' ? 'הקישור הועתק ✓' : 'Link copied ✓');
    } catch {
      show(locale === 'he' ? 'לא ניתן ליצור קישור' : 'Could not create link');
    }
    setCopying(false);
  };

  const displayLink = inviteLink
    ? inviteLink.replace(/^https?:\/\//, '')
    : (locale === 'he' ? 'טוען קישור…' : 'trippy.app/j/…');

  return (
    <div
      className="lg-scroll"
      style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', paddingBottom: 'var(--nav-total-h)' }}
    >
      {/* ── Dark hero ── */}
      <div
        className="hero-mesh"
        style={{
          padding: 'calc(env(safe-area-inset-top, 0px) + 54px) 22px 40px',
          borderRadius: '0 0 32px 32px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <div className="resp-container">
        {/* Floating compass disc */}
        <m.div
          animate={{ y: [0, -5, 0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
          style={{
            width: 84, height: 84, borderRadius: '50%',
            background: '#F4EFE8',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 18px 44px oklch(20% 0.03 60 / 36%)',
            marginBottom: 14,
          }}
        >
          <CompassMark size={58} />
        </m.div>

        <m.h1
          className="display-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: 34, color: '#fff', margin: 0 }}
        >
          {t('gatherTheTribe')}
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: 13.5, color: 'oklch(98% 0.005 80 / 78%)', margin: '8px 0 0' }}
        >
          {t('gatherSubtitle')}
        </m.p>
      </div>

      <div style={{ padding: '0 clamp(16px, 5vw, 28px)', marginTop: -22, maxWidth: 600, margin: '-22px auto 0', width: '100%', boxSizing: 'border-box' }}>

        {/* ── Invite card ── */}
        <m.div
          className="lg lg-strong"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{ padding: 18 }}
        >
          <Field
            label={t('inviteByEmailLabel')}
            placeholder="friend@example.com"
            value={email}
            onChange={setEmail}
            icon={<Icon name="user" size={15} />}
          />

          <Btn
            kind="forest"
            full
            onClick={handleSendInvite}
            disabled={sending}
            style={{
              marginTop: 12,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)', fontSize: 12,
            }}
          >
            {sending
              ? (locale === 'he' ? 'שולח…' : 'Sending…')
              : t('sendInvitesBtn')}
          </Btn>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 8px' }}>
            <div style={{ flex: 1, height: 1, background: 'oklch(50% 0.02 60 / 14%)' }} />
            <span className="eyebrow-lg" style={{ color: 'var(--text-3)' }}>
              {t('orMagicLink')}
            </span>
            <div style={{ flex: 1, height: 1, background: 'oklch(50% 0.02 60 / 14%)' }} />
          </div>

          {/* Glass link button */}
          <button
            onClick={handleGetLink}
            disabled={copying}
            className="lg-btn lg-btn-glass"
            aria-label={locale === 'he' ? 'העתק קישור הצטרפות' : 'Copy join link'}
            style={{ width: '100%', height: 48, justifyContent: 'space-between', padding: '0 18px', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {copying ? (
              <>
                <m.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'flex', flexShrink: 0 }}
                >
                  <Icon name="compass" size={15} color="var(--lg-terra)" />
                </m.span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', flex: 1, textAlign: 'start' }}>
                  {t('generatingLink')}
                </span>
              </>
            ) : (
              <>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--text-2)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, textAlign: 'start',
                }}>
                  {displayLink}
                </span>
                <Icon name="share" size={16} color="var(--lg-terra)" style={{ flexShrink: 0 }} />
              </>
            )}
          </button>
        </m.div>

        {/* ── Crew list ── */}
        <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: '22px 0 12px' }}>
          {t('currentCrew')} · {participants.length}
        </p>

        <div
          role="list"
          aria-label={t('Current crew') || 'Current crew'}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}
        >
          {participants.map((p: Participant, i: number) => {
            const isMe = p.name === nickname;
            const isOrganizer = i === 0;

            return (
              <m.div
                key={`${p.name}-${i}`}
                role="listitem"
                className="lg"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.06, duration: 0.40, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13 }}
              >
                <Avatar name={p.name} index={i} size={44} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                    {isMe && (
                      <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                        {' '}· {t('you') || 'you'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 1 }}>
                    {isOrganizer ? (t('Organizer') || 'Organizer') : (t('Member') || 'Member')}
                  </div>
                </div>

                {/* Trailing badge */}
                {isOrganizer ? (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--lg-terra)',
                    background: 'oklch(60% 0.155 38 / 12%)',
                    padding: '4px 10px', borderRadius: 9999,
                    flexShrink: 0,
                  }}>
                    {t('Organizer') || 'Organizer'}
                  </span>
                ) : (
                  <Icon name="check" size={18} color="var(--lg-forest)" style={{ flexShrink: 0 }} />
                )}
              </m.div>
            );
          })}
        </div>

        {/* ── Pending invitations I received ── */}
        {pendingInvitations.length > 0 && (
          <>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: '22px 0 12px' }}>
              {locale === 'he' ? 'הזמנות ממתינות' : 'Pending invitations'} · {pendingInvitations.length}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {pendingInvitations.map((inv, i) => (
                <m.div
                  key={inv.id}
                  className="lg"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inv.tripName}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 1 }}>
                      {locale === 'he' ? 'הזמנה להצטרף' : 'Invitation to join'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <button
                      onClick={() => acceptInvitation(inv.id).then(() => show(locale === 'he' ? 'הצטרפת לטיול' : 'Joined trip')).catch(() => show('Could not accept'))}
                      style={{ height: 34, padding: '0 12px', border: 0, borderRadius: 9999, background: 'var(--lg-forest)', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: 'var(--lg-glow-forest)' }}
                    >
                      {locale === 'he' ? 'הצטרף' : 'Join'}
                    </button>
                    <button
                      onClick={() => rejectInvitation(inv.id).catch(() => {})}
                      style={{ height: 34, padding: '0 12px', border: 0, borderRadius: 9999, background: 'var(--lg-panel)', color: 'var(--text-3)', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)' }}
                    >
                      {locale === 'he' ? 'דחה' : 'Decline'}
                    </button>
                  </div>
                </m.div>
              ))}
            </div>
          </>
        )}
        </div>{/* /resp-container */}
      </div>
    </div>
  );
}
