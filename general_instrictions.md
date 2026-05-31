# Trippy 2.0 — Crew_V2 Redesign Brief (FINAL SCREEN)

<!--
  SESSION QUEUE — after completing each screen, update this file:
  Completed: Dashboard ✓, DayDetail ✓, Navigation ✓, Home ✓, Map ✓, Packing ✓,
             Settings ✓, Sheets ✓, Splash ✓, Welcome ✓, Crew (current — LAST)
  After Crew: ALL SCREENS COMPLETE ✓
-->

## Role
You are a crew of 3 senior Next.js architects and product designers, expert in modern web design, high-quality engineering, and creative UI/UX. You collaborate on Trippy's v2.0 redesign.

## Inputs
- App structure: `Trippy_Full_Design_V2\DESIGN.md` & `Trippy_Full_Design_V2\README.md`
- Brand book: `Trippy_Full_Design_V2\Trippy Brand Book _standalone_.html`
- Trippy Atlas: `Trippy_Full_Design_V2\Trippy Icon Atlas _standalone_.html`
- New Crew spec: `Trippy_Full_Design_V2\ui_kits\liquid-glass\design\Crew\design.md`
- New Crew reference (JSX): `Trippy_Full_Design_V2\ui_kits\liquid-glass\explore.jsx` (`CrewScreen` function)
- Existing Crew file: `app\components\screens\CrewScreen.tsx`

## Mission
Build `Crew_V2` — invite card + crew list with dark hero — then retire `CrewScreen.tsx`.

## Hard rules
1. Create `Crew_V2.(jsx|tsx)`. Do NOT edit the existing CrewScreen file.
2. Spec is single source of truth.
3. Brand + Atlas assets only.
4. Reuse existing v2 components.
5. Match the JSX reference.

## Steps (in order)
1. Read all inputs.
2. Component inventory (KEEP/DROP/NEW).
3. One-line inventory confirmation.
4. Build `Crew_V2`.
5. Migrate AppShell: `dynamic(() => import('./screens/CrewScreen'))` → `Crew_V2`.
6. Confirm `CrewScreen.tsx` has zero remaining references.
7. **After session: this file has served its purpose — all screens complete.**

## Acceptance criteria
- Dark hero: floating compass disc (84px, `.a-float`), `.display-xl` "Gather the tribe", subtitle.
- Invite card (`.lg-strong`): LGField email, forest "Send invites" btn, divider, glass link btn.
- Crew list: eyebrow "Current crew · N", rows with Avatar 44, name (+ "· you"), role, Organizer pill / forest check.
- Builds clean, zero errors.

## Deliverables
1. `Crew_V2` file.
2. AppShell migration (1-line diff).
3. Confirmation `CrewScreen.tsx` dead.
4. Usability test (pass/fail).
