# Trippy 2.0 — Explore_V2 Redesign Brief

## Role
You are a crew of 3 senior Next.js architects and product designers, expert in modern web design, high-quality engineering, and creative UI/UX. You collaborate on Trippy's v2.0 redesign.

## Inputs
- App structure: `Trippy_Full_Design_V2\DESIGN.md` & `Trippy_Full_Design_V2\README.md` 
- Brand book (colors, icons, logos): `Trippy_Full_Design_V2\Trippy Brand Book _standalone_.html`
- Trippy Atlas (icon set): `Trippy_Full_Design_V2\Trippy Icon Atlas _standalone_.html`
- New assets / components / pages root: `Trippy_Full_Design_V2`
- Full HTML demo: `Trippy_Full_Design_V2\ui_kits\liquid-glass\index.html`
- New Navigation spec (markdown): `Trippy_Full_Design_V2\ui_kits\liquid-glass\design\Navigation\design.md`
- New Navigation reference (JSX): `Trippy_Full_Design_V2\ui_kits\liquid-glass`
- Existing Navigation file: `app\components\screens\NavigationScreen.tsx`

## Mission
Build the new Navigation screen (`Navigation_V2`) from scratch for Trippy 2.0, then route all traffic to it and retire the old one.

## Hard rules
1. Create a NEW file `Navigation_V2.(jsx|tsx)`. Do NOT edit, rewrite, or copy from the existing Navigation file.
2. Spec is the single source of truth. Build ONLY components listed in the new spec. If a component exists on the old Navigation but is absent from the spec (e.g. CO2 widget), do NOT add it.
3. Use only assets from the brand book and Atlas — exact brand colors, official logos, Atlas icons. No placeholder or invented assets.
4. Reuse existing v2 components from the assets root; do not duplicate or re-style them.
5. Match the demo and JSX reference for layout, spacing, component states, and responsiveness.

## Steps (in order)
1. Read all inputs.
2. Produce a component inventory table: spec components vs. old-Navigation components. Mark each as KEEP / DROP / NEW.
3. Output a one-line confirmation of the inventory before coding.
4. Build `Navigation_V2` — semantic, accessible, typed, responsive.
5. Migrate every route, link, and import that points to the old Navigation so they point to `Navigation_V2`. List each change.
6. Confirm the old Navigation has zero remaining references (fully dead).

## Acceptance criteria
- All spec components present; no out-of-spec components.
- Brand + Atlas assets only.
- Old file untouched and fully disconnected.
- Builds with no errors or warnings; no broken imports.

## Usability test (run after build, report pass/fail per item)
- All entry points reach `Navigation_V2`; no 404s or dead links.
- Every interactive element works (buttons, filters, navigation, modals).
- Responsive at mobile / tablet / desktop breakpoints.
- Loading, empty, and error states render correctly.
- No console errors/warnings.
- Keyboard navigation + basic a11y: focus order, alt text, color contrast.
- Old Navigation is unreachable from the UI.

## Deliverables
1. `Navigation_V2` file.
2. List/diff of every migrated connection.
3. Drop-list of out-of-spec components excluded.
4. Usability test report (pass/fail).

## Out of scope
Backend/API changes, other screens, and any feature not in the spec.