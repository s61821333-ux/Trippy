'use client';

interface Props {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}

export default function AsyncError({ message, onRetry, compact }: Props) {
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>
        <span>⚠ {message}</span>
        <button
          onClick={onRetry}
          style={{
            fontSize: 11, fontWeight: 700, color: 'var(--brand)',
            background: 'none', border: 'none', cursor: 'pointer',
            textDecoration: 'underline', padding: 0, minHeight: 0,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '18px 16px',
      background: 'var(--danger-bg)',
      border: '1px solid var(--danger)',
      borderRadius: 'var(--radius-md)',
    }}>
      <span style={{ fontSize: 22 }}>⚠️</span>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', textAlign: 'center' }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text-inv)',
          background: 'var(--danger)', border: 'none', cursor: 'pointer',
          borderRadius: 'var(--radius-sm)', padding: '8px 20px',
          minHeight: 44,
        }}
      >
        Retry
      </button>
    </div>
  );
}
