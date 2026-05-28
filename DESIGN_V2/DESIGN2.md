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
  forest-lt: '#8BB39A'
  forest-dk: '#2B5340'
  terra-lt: '#E0916B'
  gold-lt: '#E6B574'
  ink: '#1A1410'
  ink-soft: '#3A2E26'
  glass-base: rgba(255, 255, 255, 0.45)
  glass-float: rgba(255, 255, 255, 0.65)
  coral-glow: '#E05A3A'
typography:
  display:
    fontFamily: Bricolage Grotesque
    fontSize: 120px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.035em
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.035em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.025em
  serif-editorial:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 22px
    fontWeight: '400'
    lineHeight: '1.45'
  body-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.18em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  page-margin: 120px
  gutter: 48px
  stack-lg: 64px
  stack-md: 24px
  stack-sm: 12px
  jelly-gap: 20px
---

## Brand & Style

This design system embodies the **Jelly Liquid Glass** aesthetic—a futuristic, ultra-tactile evolution of glassmorphism designed for a premium travel experience. It balances the precision of high-end software with the organic, tension-free beauty of liquid.

### Style: Jelly Liquid Glass
The UI is built on the metaphor of thick, clear, polymer-like surfaces. Unlike traditional flat design, this style uses **extreme translucency**, **40px backdrop blurs**, and **exaggerated "jelly" roundedness** to create a sense of physical volume.

### Emotional Response
- **Human-Centric & Soft:** Avoiding the coldness of standard tech by using organic shapes and warm, desert-inspired tones.
- **Thoughtful & Bespoke:** A sense of craftsmanship through custom typography pairings and high-fidelity depth.
- **Fluid & Responsive:** The UI should feel like it is floating and reacting to touch, mimicking the physics of a liquid lens.

## Colors

The palette is rooted in a "Desert Landscape" motif, contrasting deep vegetation greens with warm earth and sand tones.

- **Primary (Forest):** Used for core branding, dense page headers, and primary navigation states.
- **Secondary (Terracotta):** Reserved for high-priority Call-to-Actions (CTAs), critical wayfinding (North), and error states.
- **Tertiary (Sand Gold):** Used for highlights, active status indicators, and secondary UI iconography.
- **Neutral (Paper):** A warm, parchment-like off-white used as the foundation for the liquid glass layers to rest upon.

**Liquid Glass Tints:** Surface colors are rarely opaque. Use `glass-base` for standard cards and `glass-float` for elevated interactions. Every glass surface must utilize a `40px` backdrop-blur to achieve the "thick jelly" depth.

## Typography

The typography system is a sophisticated pairing of technical utility and editorial warmth.

- **Bricolage Grotesque:** The workhorse for the UI. It provides a unique, expressive personality with its quirky terminals and tight tracking. Use for all functional UI, headers, and body copy.
- **Newsreader (Italic):** Reserved specifically for "Editorial Moments"—quotes, taglines, and storytelling narratives. It should always be used in its italic variant to contrast against the geometric sans.
- **JetBrains Mono:** The "Wayfinding" font. Used for technical metadata, coordinates, dates, and small labels to give a sense of cartographic precision.

## Layout & Spacing

This design system uses a **Fixed Grid** philosophy for large-screen layouts to maintain the "Poster" aesthetic, transitioning to a fluid model for mobile.

### Grid Model
- **Desktop:** 12-column grid with a **120px margin** and **48px gutter**. Primary content containers should never feel crowded; whitespace is a tool for luxury.
- **Mobile:** 4-column fluid grid with **20px margins**. 

### Spacing Rhythm
The rhythm is dictated by the "Liquid" metaphor—elements should have enough "surface tension" (padding) around them. Use `stack-lg` for section breaks and `stack-sm` for grouping related "Jelly" components. Elements within a glass card should use a minimum internal padding of **28px** to match the corner radius.

## Elevation & Depth

Depth is the defining characteristic of this system. It is achieved through three layered techniques:

1.  **Backdrop Blur:** All interactive surfaces must apply a `40px` blur to the layer beneath them. This creates the illusion of "thick glass."
2.  **Specular Inner Glow:** To simulate the edges of a liquid drop, cards should have a subtle top-down `1px` white inner stroke at 20% opacity.
3.  **Deep Soft Shadows:** Shadows are expansive and low-opacity.
    - **Floating Cards:** `0 12px 40px rgba(26, 20, 16, 0.08)`
    - **Active/Hover Modals:** `0 40px 80px rgba(26, 20, 16, 0.15)`
4.  **No Borders:** Avoid hard CSS borders. Separation is achieved entirely through the shift in blur density and shadow depth.

## Shapes

The shape language is **Organic and Liquid**. 

- **Primary Surfaces:** Standard cards and containers use a **28px** radius to create the "Jelly" feel.
- **Buttons & Chips:** Always use the **Pill-shaped (rounded-full)** setting to emphasize fluidity.
- **Interactive States:** On hover, shapes should subtly expand (scale 1.02), mimicking the surface tension of a water droplet before it breaks.
- **Corners:** Avoid sharp angles at all costs. Even "square" images should have a minimum **18px** radius.

## Components

### Liquid Buttons
- **Base:** Pill-shaped, `glass-float` background.
- **Interaction:** On hover, increase `backdrop-blur` to 60px and scale up slightly. On press, use a "spring" physics animation (scale 0.95).
- **Primary:** Uses a soft gradient of `Primary Deep Teal` to `Forest-lt` with a white `label-mono` text.

### Jelly Glass Cards
- **Structure:** 28px corner radius, 40px blur, no border.
- **Content:** Titles in `headline-md`, metadata in `label-mono`.
- **Usage:** Used for itinerary events, weather widgets, and trip overview snippets.

### Timeline Nodes
- **Style:** Small 12px "drops" of `Secondary Terracotta`.
- **Active State:** The drop expands to 20px and gains a soft outer glow of the same color.

### Input Fields
- **Style:** Understated. A `glass-base` capsule with `ink-soft` placeholder text in `body-sm`. 
- **Focus:** The inner-glow thickens to 2px and the shadow deepens to `Primary Deep Teal` at 5% opacity.

### Navigation (The Floating Pill)
- **Style:** A single, large floating capsule at the bottom of the screen.
- **Glass:** Highly translucent `glass-float` to allow the background content to "melt" behind it.
- **Icons:** 24px custom line icons with a 1.5px stroke weight.