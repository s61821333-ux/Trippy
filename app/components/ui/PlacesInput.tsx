'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon';

export interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting?: { main_text: string };
}

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (name: string) => void;
  onSelect: (place: PlaceResult) => void;
}

export default function PlacesInput({ label, placeholder, value, onChange, onSelect }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (text: string) => {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?input=${encodeURIComponent(text)}`);
        if (!res.ok) { setPredictions([]); return; }
        const data = await res.json();
        if (Array.isArray(data)) {
          setPredictions(data);
          setOpen(data.length > 0);
        }
      } catch {
        setPredictions([]);
      }
    }, 300);
  };

  const handleSelect = async (pred: Prediction) => {
    onChange(pred.description);
    setPredictions([]);
    setOpen(false);
    setResolving(true);
    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(pred.place_id)}`);
      if (res.ok) {
        const detail = await res.json();
        onSelect({ name: detail.name ?? pred.description, lat: detail.lat, lng: detail.lng });
      }
    } catch {}
    setResolving(false);
  };

  return (
    <div ref={containerRef}>
      {label && (
        <label style={{
          display: 'block', fontSize: 12, fontWeight: 600,
          color: 'var(--text-2)', letterSpacing: '0.03em', marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', insetInlineStart: 12, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-3)', display: 'flex', pointerEvents: 'none',
        }}>
          {resolving ? (
            <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--brand)', animation: 'spin 0.8s linear infinite', display: 'block' }} aria-hidden />
          ) : (
            <Icon name="pin" size={14} />
          )}
        </span>
        <input
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          name="location-search"
          placeholder={placeholder}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          className="input-premium"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            padding: '11px 14px 11px 38px',
            width: '100%',
            outline: 'none',
            minHeight: 44,
            boxSizing: 'border-box',
          }}
        />
        {open && predictions.length > 0 && (
          <ul id={listboxId} role="listbox" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginTop: 4,
            padding: 0,
            listStyle: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}>
            {predictions.map((pred, i) => (
              <li
                key={pred.place_id}
                role="option"
                aria-selected={false}
                onMouseDown={() => handleSelect(pred)}
                onTouchEnd={e => { e.preventDefault(); handleSelect(pred); }}
                style={{
                  padding: '12px 14px', minHeight: 48,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--text)',
                  borderBottom: i < predictions.length - 1 ? '1px solid var(--border)' : 'none',
                  touchAction: 'manipulation',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontWeight: 600 }}>
                  {pred.structured_formatting?.main_text ?? pred.description.split(',')[0]}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', marginInlineStart: 4 }}>
                  {pred.description.split(',').slice(1).join(',').trim()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
