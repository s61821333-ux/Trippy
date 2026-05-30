'use client';

import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';
import CompassMark from '../ui/CompassMark';

const AVC = ['#C4714A', '#C8944A', '#3B6E52', '#2B7A8E', '#A03CB4', '#1E91AF'];

function Avatar({ name, i = 0, size = 44 }: { name: string; i?: number; size?: number }) {
  const t = (name || '?').trim().split(/\s+/).map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: AVC[i % AVC.length], color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.36,
      letterSpacing: '-0.02em',
    }}>
      {t || '?'}
    </div>
  );
}

export default function CrewScreen() {
  const { t } = useI18n();
  const { show } = useToast();

  const { trip, tripDbId, userId, nickname, inviteToTrip, createInviteLink,
          pendingInvitations, loadInvitations } = useAppStore(
    useShallow(s => ({
      trip:               s.trip,
      tripDbId:           s.tripDbId,
      userId:             s.userId,
      nickname:           s.nickname,
      inviteToTrip:       s.inviteToTrip,
      createInviteLink:   s.createInviteLink,
      pendingInvitations: s.pendingInvitations,
      loadInvitations:    s.loadInvitations,
    }))
  );

  const [emailValue, setEmailValue]   = useState('');
  const [sending, setSending]         = useState(false);
  const [linkCopying, setLinkCopying] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const isOwner = trip?.createdBy
    ? trip.createdBy === userId
    : trip?.participants[0]?.name === nickname;

  useEffect(() => {
    if (tripDbId) loadInvitations().catch(() => {});
  }, [tripDbId]);

  if (!trip) return null;

  const participants = trip.participants ?? [];

  const handleSendInvite = async () => {
    const email = emailValue.trim();
    if (!email || !email.includes('@')) return;
    setSending(true);
    try {
      await inviteToTrip(email);
      show(t('inviteSent'));
      setEmailValue('');
      loadInvitations().catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('limit')) show(t('inviteLimitReached'));
      else show(t('inviteFailed'));
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (linkCopying) return;
    setLinkCopying(true);
    try {
      const link = await createInviteLink();
      await navigator.clipboard.writeText(link);
      show(t('linkCopied'));
    } catch {
      show(t('noLink'));
    } finally {
      setTimeout(() => setLinkCopying(false), 1500);
    }
  };

  return (
    <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', paddingBottom: 110 }}>
      {/* Hero mesh header */}
      <div className="hero-mesh" style={{ padding: '54px 22px 40px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div className="a-float" style={{
          width: 84, height: 84, borderRadius: '50%', background: '#F4EFE8',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 18px 44px oklch(20% 0.03 60 / 36%)', marginBottom: 14,
        }}>
          <CompassMark size={58} />
        </div>
        <h1 className="display-xl" style={{ fontSize: 34, color: '#fff', margin: 0 }}>
          {t('crewTitle') as string || 'Gather the tribe'}
        </h1>
        <p style={{ fontSize: 13.5, color: 'oklch(98% 0.005 80 / 78%)', margin: '8px 0 0' }}>
          Add friends to sync itineraries and share memories in real time.
        </p>
      </div>

      <div style={{ padding: '0 20px', marginTop: -22 }}>
        {/* Invite card */}
        <m.div
          className="lg lg-strong a-rise"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.15 }}
          style={{ padding: 18, marginBottom: 22 }}
        >
          {/* Email field */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8, fontWeight: 600 }}>
              {t('inviteByEmail') as string || 'Invite by email'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', insetInlineStart: 15, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                <Icon name="user" size={17} color="var(--text-3)" />
              </span>
              <input
                ref={emailRef}
                type="email"
                dir="ltr"
                value={emailValue}
                onChange={e => setEmailValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendInvite(); }}
                placeholder={t('inviteEmailPlaceholder') as string || 'friend@example.com'}
                aria-label={t('inviteByEmail') as string || 'Invite by email'}
                style={{
                  width: '100%', boxSizing: 'border-box', height: 48, border: 0,
                  borderRadius: 14, paddingInlineStart: 42, paddingInlineEnd: 16,
                  fontFamily: 'var(--font-sans)', fontSize: 15,
                  color: 'var(--lg-ink)', outline: 'none',
                  background: 'var(--lg-panel-strong)',
                  boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)',
                }}
              />
            </div>
          </div>

          <m.button
            onClick={handleSendInvite}
            disabled={sending || !emailValue.trim().includes('@')}
            whileTap={{ scale: 0.97 }}
            className="lg-btn lg-btn-forest"
            style={{
              width: '100%', height: 52, marginTop: 12, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
              opacity: (sending || !emailValue.trim().includes('@')) ? 0.5 : 1,
            }}
          >
            {sending ? '…' : (t('sendInvites') as string || 'Send invites')}
          </m.button>

          {/* Or divider + magic link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 8px' }}>
            <div style={{ flex: 1, height: 1, background: 'oklch(50% 0.02 60 / 14%)' }} />
            <span className="eyebrow-lg" style={{ color: 'var(--text-3)' }}>or magic link</span>
            <div style={{ flex: 1, height: 1, background: 'oklch(50% 0.02 60 / 14%)' }} />
          </div>

          <button
            onClick={handleCopyLink}
            className="lg-btn lg-btn-glass"
            style={{ width: '100%', height: 48, justifyContent: 'space-between', padding: '0 18px' }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
              {linkCopying ? 'Copied!' : 'trippy.app/join/' + (trip.name?.toLowerCase().replace(/\s+/g, '-').slice(0, 20) || 'trip')}
            </span>
            <Icon name={linkCopying ? 'check' : 'share'} size={16} color="var(--lg-terra)" />
          </button>
        </m.div>

        {/* Current crew */}
        <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: '22px 0 12px' }}>
          {t('currentCrew') as string || 'Current crew'} · {participants.length}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {participants.map((p, i) => {
            const isMe = p.name === nickname;
            return (
              <m.div
                key={p.id ?? p.name}
                className="lg a-rise"
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, animationDelay: `${i * 0.06}s` }}
              >
                <Avatar name={p.name} i={i} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)' }}>
                    {p.name}
                    {isMe && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> · {t('you') as string || 'you'}</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 1 }}>
                    {i === 0 ? (t('organizer') as string || 'Organizer') : (t('member') as string || 'Member')}
                  </div>
                </div>
                {i === 0 ? (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--lg-terra)', background: 'oklch(60% 0.155 38 / 12%)',
                    padding: '4px 10px', borderRadius: 9999,
                  }}>
                    {t('organizer') as string || 'Organizer'}
                  </span>
                ) : (
                  <Icon name="check" size={18} color="var(--lg-forest)" />
                )}
              </m.div>
            );
          })}
        </div>

        {/* Pending outgoing invites count */}
        {pendingInvitations.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>
              {t('pendingInvites') as string || 'Pending'} · {pendingInvitations.length}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingInvitations.map((inv, i) => (
                <div key={inv.id || i} className="lg" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <Icon name="user" size={18} color="var(--text-3)" />
                  <span style={{ flex: 1, fontSize: 13.5, color: 'var(--lg-ink)' }}>{inv.tripName}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--lg-panel-strong)', padding: '3px 9px', borderRadius: 9999 }}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginTop: 24, textAlign: 'center' }}>
          Crew members can view and contribute to the &quot;{trip.name}&quot; itinerary.
        </p>
      </div>
    </div>
  );
}
