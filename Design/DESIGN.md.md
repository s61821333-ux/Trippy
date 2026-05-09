# Design System: Jelly Liquid Glass (Updated)

## Brand Vision
A futuristic, playful, and ultra-clear travel companion. The "Jelly Liquid Glass" aesthetic focuses on extreme translucency, organic "jelly-like" shapes, and a vibrant, friendly color palette inspired by desert landscapes under a bright sun.

## Design Principles
- **Melted Fluidity:** Every container and button should feel like a drop of liquid—highly rounded, smooth, and tension-free.
- **Extreme Translucency:** Moving beyond standard glassmorphism, the "Jelly" look uses minimal opacity with heavy `backdrop-blur` (up to 40px) to create a sense of clear, thick material.
- **Floating Architecture:** Components should have no hard borders or solid backgrounds. They should appear to float effortlessly over the background via soft, deep shadows.
- **Friendly Vibrancy:** A high-saturation palette that feels energetic and welcoming, using "Liquid Gold" and "Deep Teal" as primary drivers.

## Visual Language

### Color Palette

#### Primary & Accents
- **Primary Deep Teal:** `#2da1ad` — Used for main brand elements, active states, and primary buttons.
- **Sun Gold:** `#d4a85a` — Used for highlights, active timeline markers, and warm accents.
- **Desert Rust:** `#8a6030` — Used for high-contrast text and secondary icons.
- **Coral Glow:** `oklch(58% 0.17 28)` — Used for notifications and status alerts.

#### Surfaces (Liquid Glass)
- **Base Glass:** `rgba(255, 255, 255, 0.45)` — Standard surface for cards and timeline items.
- **Floating Glass:** `rgba(255, 255, 255, 0.65)` — For active or primary floating elements.
- **Backdrop Blur:** `40px` — Used on all glass surfaces for the "thick liquid" look.
- **Shadows:** `0 12px 40px rgba(80, 60, 20, 0.08)` — Soft, expansive shadows to simulate floating.

### Typography
- **Headlines (Serif):** 'Noto Serif'
  - High-contrast, elegant serif for a premium "journal" feel. Used for titles and big numbers.
- **Body & UI (Sans):** 'DM Sans'
  - Clean, high-legibility sans-serif for labels, timings, and metadata.

### UI Components

#### Top Navigation (The "Jelly Pill")
- **Shape:** Ultra-rounded capsule (pill shape).
- **Style:** Floating, borderless glass with high-translucency.
- **Icons:** Minimalist, rounded line icons.

#### Timeline & Schedule Cards
- **Structure:** Distinct components arranged along a vertical axis.
- **Style:** Each activity is a floating glass card with rounded corners (minimum 28px radius).
- **Indicators:** Circular timeline nodes that glow when active.

#### Liquid Buttons
- **Shape:** Full capsule (`rounded-full`).
- **Texture:** Soft gradients and subtle inner-glow to simulate a "jelly" surface.
- **Interactions:** Subtle scale-down and "liquid" bounce on press.

## Interaction Patterns
- **Liquid Scroll:** Smooth, momentum-based scrolling with parallax backgrounds.
- **Component Entry:** Cards should "float up" into view with a soft ease-out animation.
- **Zero-Border Menus:** Dropdowns and sheets use only shadow and blur for separation, never hard lines.
