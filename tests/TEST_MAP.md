# Test Map

This suite is now centered on user experience, appearance, and usability on two targets: iPhone 17-sized Chrome mobile and Desktop Chrome.

## Kept

- `01-navbar.spec.ts` - main navigation visibility, tab switching, and menu behavior.
- `02-day-view.spec.ts` - event card readability, quick actions, and sheet flows.
- `03-packing.spec.ts` - packing list visibility, controls, and item interaction.
- `04-crew.spec.ts` - crew list visibility and invite flow.
- `05-settings.spec.ts` - theme, language, and layout checks.
- `06-accessibility.spec.ts` - core accessibility and touch-target usability smoke checks.

## Removed

- `00-server.spec.ts` - API health checks, not user-facing UX.
- `07-auth-flow.spec.ts` - auth and persistence regressions, mostly infrastructure-level coverage.
- `08-mobile-ux.spec.ts` - overlapped heavily with the kept screen-by-screen UX specs.
- `09-persistence-sync.spec.ts` - sync and DB regression checks, not part of the UX focus.