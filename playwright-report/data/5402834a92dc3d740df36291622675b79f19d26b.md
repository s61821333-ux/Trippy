# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uiux\05-settings.spec.ts >> Settings Screen >> Settings heading is visible and not blank
- Location: tests\uiux\05-settings.spec.ts:37:7

# Error details

```
Test timeout of 30000ms exceeded.
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
    - generic [ref=e17]:
      - generic:
        - generic:
          - generic:
            - img
      - generic [ref=e18]:
        - generic [ref=e19]: Trippy.
        - paragraph [ref=e20]: Plan. Explore. Experience.
        - paragraph [ref=e21]: The new standard in collaborative travel. From desert dunes to city lights, your journey begins here.
        - button "Start an adventure" [ref=e22] [cursor=pointer]:
          - generic [ref=e23]: Start an adventure
          - img [ref=e26]
        - generic [ref=e29]:
          - generic [ref=e30]: Collaborate
          - generic [ref=e32]: Discover
          - generic [ref=e34]: Document
    - generic [ref=e35]:
      - button "Skip" [ref=e37] [cursor=pointer]
      - generic [ref=e39]:
        - generic [ref=e41]:
          - generic [ref=e42]:
            - generic [ref=e43]: ☕
            - generic [ref=e44]:
              - paragraph [ref=e45]: Coffee & Croissant
              - paragraph [ref=e46]: 09:00
          - generic [ref=e49]:
            - generic [ref=e50]: 🏛️
            - generic [ref=e51]:
              - paragraph [ref=e52]: Louvre Museum
              - paragraph [ref=e53]: 11:00
          - generic [ref=e56]:
            - generic [ref=e57]: 🍽️
            - generic [ref=e58]:
              - paragraph [ref=e59]: Lunch at Le Marais
              - paragraph [ref=e60]: 14:00
        - heading "Plan your trip. Together." [level=1] [ref=e63]
        - paragraph [ref=e64]: Build a shared itinerary in real time with everyone on the trip.
      - generic [ref=e65]:
        - generic [ref=e66]:
          - button [ref=e67] [cursor=pointer]
          - button [ref=e68] [cursor=pointer]
          - button [ref=e69] [cursor=pointer]
        - button "Next →" [ref=e70] [cursor=pointer]
```