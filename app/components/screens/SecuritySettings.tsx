'use client';

import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Sheet from '../ui/Sheet';
import Icon from '../ui/Icon';
import GlassBtn from '../ui/GlassBtn';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../ui/Toast';
import {
  mfaListFactors,
  mfaEnrollTotp,
  mfaChallengeAndVerify,
  mfaUnenroll,
} from '@/lib/db';

// Strip script tags, on* handlers, and javascript: hrefs from an SVG string
// before rendering via dangerouslySetInnerHTML.
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
}

interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: 'verified' | 'unverified';
}

interface EnrollData {
  factorId: string;
  qrCode: string;
  secret: string;
}

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 0',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 14.5,
  fontWeight: 600,
  color: 'var(--lg-ink)',
};

const SUB_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-3)',
  marginTop: 2,
};

const SECTION_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--lg-terra)',
  marginBottom: 8,
  marginTop: 4,
};

const DIVIDER: React.CSSProperties = {
  height: 1,
  background: 'oklch(50% 0.02 60 / 10%)',
  margin: '2px 0',
};

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        style={{
          width: '100%',
          height: 56,
          fontSize: 28,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          letterSpacing: '0.3em',
          textAlign: 'center',
          background: 'oklch(100% 0 0 / 6%)',
          border: '1.5px solid oklch(50% 0.02 60 / 18%)',
          borderRadius: 16,
          color: 'var(--lg-ink)',
          outline: 'none',
          caretColor: 'var(--lg-terra)',
        }}
        autoComplete="one-time-code"
      />
    </div>
  );
}

// Set to true when Supabase TOTP/MFA is re-enabled in the project settings.
const TOTP_ENABLED = false;

export default function SecuritySettings({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const { show } = useToast();
  const isHe = locale === 'he';

  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);

  // TOTP enrollment flow
  const [enrollData, setEnrollData] = useState<EnrollData | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Pending removes
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const mfaData = await mfaListFactors();
      setFactors(mfaData.totp ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totpFactors = factors.filter(f => f.factor_type === 'totp' && f.status === 'verified');

  // ── TOTP enroll ──────────────────────────────────────────────────────────────
  const handleStartTotp = async () => {
    try {
      const data = await mfaEnrollTotp(isHe ? 'אפליקציית אימות' : 'Authenticator App');
      setEnrollData({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      setOtpCode('');
    } catch {
      show(isHe ? 'שגיאה בהפעלת MFA' : 'Could not start MFA setup');
    }
  };

  const handleVerifyTotp = async () => {
    if (!enrollData || otpCode.length !== 6) return;
    setVerifying(true);
    try {
      await mfaChallengeAndVerify(enrollData.factorId, otpCode);
      show(isHe ? '✓ אימות דו-שלבי הופעל!' : '✓ Two-factor auth enabled!');
      setEnrollData(null);
      setOtpCode('');
      await load();
    } catch {
      show(isHe ? 'קוד שגוי, נסה שוב' : 'Wrong code - try again');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelTotp = async () => {
    if (enrollData) {
      // Clean up the unverified factor
      try { await mfaUnenroll(enrollData.factorId); } catch { /* ignore */ }
    }
    setEnrollData(null);
    setOtpCode('');
  };

  // ── Unenroll ─────────────────────────────────────────────────────────────────
  const handleRemove = async (factorId: string) => {
    setRemovingId(factorId);
    try {
      await mfaUnenroll(factorId);
      show(isHe ? 'הוסר בהצלחה' : 'Removed successfully');
      await load();
    } catch {
      show(isHe ? 'שגיאה בהסרה' : 'Could not remove');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Sheet
      title={isHe ? 'אבטחה' : 'Security'}
      subtitle={isHe ? 'הגנה על החשבון שלך' : 'Protect your account'}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 16 }}>

        {/* ── Two-Factor Auth — hidden until TOTP_ENABLED = true ──────────────── */}
        {TOTP_ENABLED && <p style={SECTION_STYLE}>{isHe ? 'אימות דו-שלבי' : 'Two-Factor Auth'}</p>}

        {TOTP_ENABLED && <m.div className="lg" style={{ padding: '4px 16px', marginBottom: 20 }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {loading ? (
            <div style={{ ...ROW_STYLE, opacity: 0.4 }}>
              <span style={LABEL_STYLE}>{isHe ? 'טוען…' : 'Loading…'}</span>
            </div>
          ) : totpFactors.length > 0 ? (
            totpFactors.map(f => (
              <React.Fragment key={f.id}>
                <div style={ROW_STYLE}>
                  <span className="lg-btn lg-btn-glass" style={{ width: 38, height: 38, padding: 0, flexShrink: 0 }}>
                    <Icon name="lock" size={17} color="var(--lg-forest)" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={LABEL_STYLE}>{f.friendly_name || (isHe ? 'אפליקציית אימות' : 'Authenticator App')}</div>
                    <div style={SUB_STYLE}>
                      <span style={{ color: 'var(--lg-forest)', fontWeight: 600 }}>
                        {isHe ? '● פעיל' : '● Active'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(f.id)}
                    disabled={removingId === f.id}
                    style={{
                      background: 'var(--danger-bg)', color: 'var(--danger)',
                      border: 0, borderRadius: 10, padding: '6px 12px',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      opacity: removingId === f.id ? 0.5 : 1,
                    }}
                  >
                    {isHe ? 'הסר' : 'Remove'}
                  </button>
                </div>
              </React.Fragment>
            ))
          ) : !enrollData ? (
            <div style={ROW_STYLE}>
              <span className="lg-btn lg-btn-glass" style={{ width: 38, height: 38, padding: 0, flexShrink: 0 }}>
                <Icon name="lock" size={17} color="var(--text-3)" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={LABEL_STYLE}>{isHe ? 'אפליקציית אימות' : 'Authenticator App'}</div>
                <div style={SUB_STYLE}>{isHe ? 'הוסף שכבת הגנה נוספת' : 'Add an extra layer of protection'}</div>
              </div>
              <button
                onClick={handleStartTotp}
                style={{
                  background: 'var(--lg-forest)', color: '#fff',
                  border: 0, borderRadius: 10, padding: '6px 14px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {isHe ? 'הפעל' : 'Enable'}
              </button>
            </div>
          ) : null}

          {/* ── TOTP enrollment wizard ─────────────────────────────────────── */}
          <AnimatePresence>
            {enrollData && (
              <m.div
                key="totp-wizard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                style={{ paddingTop: 8, paddingBottom: 4 }}
              >
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.55 }}>
                  {isHe
                    ? 'סרוק את קוד ה-QR עם Google Authenticator, Authy או כל אפליקציית TOTP.'
                    : 'Scan the QR code with Google Authenticator, Authy, or any TOTP app.'}
                </p>

                {/* QR code — SVG sanitized to strip script/handler injection vectors */}
                <div
                  style={{
                    display: 'flex', justifyContent: 'center', marginBottom: 16,
                    background: '#fff', borderRadius: 16, padding: 12,
                  }}
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(enrollData.qrCode) }}
                />

                {/* Backup secret */}
                <div style={{
                  background: 'oklch(100% 0 0 / 6%)',
                  border: '1px dashed oklch(50% 0.02 60 / 22%)',
                  borderRadius: 12, padding: '10px 14px', marginBottom: 20,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', margin: '0 0 4px' }}>
                    {isHe ? 'קוד גיבוי' : 'Backup secret'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.14em', color: 'var(--lg-ink)', wordBreak: 'break-all', margin: 0 }}>
                    {enrollData.secret}
                  </p>
                </div>

                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)', marginBottom: 10 }}>
                  {isHe ? 'הזן את הקוד מהאפליקציה לאימות' : 'Enter the code from your app to confirm'}
                </p>

                <OtpInput value={otpCode} onChange={setOtpCode} />

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button
                    onClick={handleCancelTotp}
                    style={{
                      flex: 1, height: 46, border: 0, borderRadius: 14, cursor: 'pointer',
                      background: 'oklch(100% 0 0 / 6%)', color: 'var(--text-3)', fontWeight: 600, fontSize: 14,
                    }}
                  >
                    {isHe ? 'ביטול' : 'Cancel'}
                  </button>
                  <GlassBtn
                    variant="accent"
                    size="lg"
                    onClick={handleVerifyTotp}
                    disabled={otpCode.length !== 6 || verifying}
                    style={{ flex: 2, opacity: (otpCode.length !== 6 || verifying) ? 0.5 : 1 }}
                  >
                    {verifying
                      ? (isHe ? 'מאמת…' : 'Verifying…')
                      : (isHe ? 'אמת והפעל' : 'Verify & Enable')}
                  </GlassBtn>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>}

      </div>
    </Sheet>
  );
}
