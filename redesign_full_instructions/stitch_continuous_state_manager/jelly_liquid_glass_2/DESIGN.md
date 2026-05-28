---
name: Jelly Liquid Glass
colors:
  surface: '#fef9f2'
  surface-dim: '#ded9d3'
  surface-bright: '#fef9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3ec'
  surface-container: '#f2ede6'
  surface-container-high: '#ece7e1'
  surface-container-highest: '#e7e2db'
  on-surface: '#1d1b17'
  on-surface-variant: '#414943'
  inverse-surface: '#32302c'
  inverse-on-surface: '#f5f0e9'
  outline: '#717972'
  outline-variant: '#c0c9c1'
  surface-tint: '#35684d'
  primary: '#22553b'
  on-primary: '#ffffff'
  primary-container: '#3b6e52'
  on-primary-container: '#b7eecb'
  inverse-primary: '#9cd3b1'
  secondary: '#934a27'
  on-secondary: '#ffffff'
  secondary-container: '#ffa277'
  on-secondary-container: '#783614'
  tertiary: '#6a4400'
  on-tertiary: '#ffffff'
  tertiary-container: '#875b15'
  on-tertiary-container: '#ffdcb1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b8efcc'
  primary-fixed-dim: '#9cd3b1'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#1c5036'
  secondary-fixed: '#ffdbcd'
  secondary-fixed-dim: '#ffb595'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#753311'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#f5bc6e'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#fef9f2'
  on-background: '#1d1b17'
  surface-variant: '#e7e2db'
  success: '#2E7D55'
  ink: '#1A1410'
  base-glass: rgba(255, 255, 255, 0.45)
  floating-glass: rgba(255, 255, 255, 0.65)
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  journal-tagline:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  container-max: 1200px
---

# Design System: Trippy v2 — Jelly Liquid Glass

## Brand Vision
A futuristic, playful, and ultra-clear travel companion. The aesthetic focuses on extreme translucency, organic "jelly-like" shapes, and a vibrant, friendly color palette inspired by nature under a bright sun.

## Design Principles
- **Melted Fluidity:** Every container and button feels like a drop of liquid—highly rounded, smooth, and tension-free.
- **Extreme Translucency:** Uses minimal opacity with heavy `backdrop-blur` (up to 40px) to create a sense of clear, thick material.
- **Floating Architecture:** Components have no hard borders or solid backgrounds. They appear to float effortlessly via soft, deep shadows.
- **Full Branding Emblems:** Every icon is a multi-colored "Tiny Compass" emblem, moving away from monochrome lines to rich, branded marks.

## Visual Language

### Color Palette

#### Primary & Accents
- **Forest:** `#3B6E52` — Primary brand depth.
- **Terracotta:** `#C4714A` — Reserved for primary actions and "North" indicators.
- **Sand Gold:** `#C8944A` — Highlights and "East/West" indicators.
- **Success:** `#2E7D55` — Confirmation and positive states.
- **Ink:** `#1A1410` — High-contrast text and "Hub" details.
- **Paper:** `#F4EFE8` — Neutral light ground.

#### Surfaces (Liquid Glass)
- **Base Glass:** `rgba(255, 255, 255, 0.45)`
- **Floating Glass:** `rgba(255, 255, 255, 0.65)`
- **Backdrop Blur:** `40px`
- **Shadows:** `0 12px 40px rgba(26, 20, 16, 0.08)`

### Typography
- **Headlines:** 'Bricolage Grotesque' (700) — Geometric, tight tracking.
- **expressive:** 'Newsreader' (Italic, 500) — For "Journal" style taglines.
- **Labels:** 'JetBrains Mono' — For technical and meta details.

### Iconography: The UI Emblems
Icons are 80x80 emblems with a 33r Ink ring and flat-filled brand shapes. No internal strokes.

## Interaction Patterns
- **Specular Highlights:** Dynamic shines that respond to scroll or tilt.
- **Jelly Sliders:** Continuous, elastic slider interactions for time and duration.
- **Liquid Morphing:** Screen transitions that feel like merging drops.
