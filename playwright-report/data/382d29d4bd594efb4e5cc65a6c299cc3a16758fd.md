# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uiux\01-navbar.spec.ts >> NavBar >> has visible text labels on tabs
- Location: tests\uiux\01-navbar.spec.ts:18:7

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
  - alert [ref=e11]
  - generic [ref=e12]:
    - generic "Trippy" [ref=e17]:
      - generic [ref=e18]:
        - img [ref=e21]
        - generic [ref=e28]: Trippy.
    - generic [ref=e29]:
      - button "Skip" [ref=e31] [cursor=pointer]
      - generic [ref=e33]:
        - generic [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e37]: ☕
            - generic [ref=e38]:
              - paragraph [ref=e39]: Coffee & Croissant
              - paragraph [ref=e40]: 09:00
          - generic [ref=e43]:
            - generic [ref=e44]: 🏛️
            - generic [ref=e45]:
              - paragraph [ref=e46]: Louvre Museum
              - paragraph [ref=e47]: 11:00
          - generic [ref=e50]:
            - generic [ref=e51]: 🍽️
            - generic [ref=e52]:
              - paragraph [ref=e53]: Lunch at Le Marais
              - paragraph [ref=e54]: 14:00
        - heading "Plan your trip. Together." [level=1] [ref=e57]
        - paragraph [ref=e58]: Build a shared itinerary in real time with everyone on the trip.
      - generic [ref=e59]:
        - generic [ref=e60]:
          - button [ref=e61] [cursor=pointer]
          - button [ref=e62] [cursor=pointer]
          - button [ref=e63] [cursor=pointer]
        - button "Next →" [ref=e64] [cursor=pointer]
```