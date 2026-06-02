# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uiux\02-packing.spec.ts >> Packing List >> Water category is labeled "Drinks" or "Drinks & Water", not just "Water"
- Location: tests\uiux\02-packing.spec.ts:50:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e13]
  - generic [ref=e14]:
    - img [ref=e15]
    - generic [ref=e22]: Trippy.
```