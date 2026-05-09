'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

export interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
}

interface GeoapifyFeature {
  properties: {
    formatted: string;
    name?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (name: string) => void;
  onSelect: (place: PlaceResult) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';

export default function PlacesInput({ label, placeholder, value, onChange, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${API_KEY}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.features ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelect = (feature: GeoapifyFeature) => {
    const name = feature.properties.name ?? feature.properties.formatted;
    const [lng, lat] = feature.geometry.coordinates;
    onChange(feature.properties.formatted);
    onSelect({ name, lat, lng });
    setSuggestions([]);
    setOpen(false);
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
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-3)', display: 'flex', pointerEvents: 'none',
        }}>
          <Icon name="pin" size={14} />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
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
        {open && suggestions.length > 0 && (
          <ul style={{
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
            {suggestions.map((feature, i) => (
              <li
                key={i}
                onMouseDown={() => handleSelect(feature)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--text)',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {feature.properties.formatted}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
