# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.ts >> Reschedule modal >> event card shows Reschedule quick action
- Location: tests\ui.spec.ts:236:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Reschedule')
Expected: visible
Error: strict mode violation: getByText('Reschedule') resolved to 2 elements:
    1) <span>Reschedule</span> aka getByRole('button', { name: 'Reschedule' }).first()
    2) <span>Reschedule</span> aka getByRole('button', { name: 'Reschedule' }).nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Reschedule')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation "Main navigation" [ref=e4]:
      - button "Menu" [ref=e5] [cursor=pointer]:
        - img [ref=e8]
      - button "Overview" [ref=e11] [cursor=pointer]:
        - img [ref=e14]
        - generic [ref=e20]: Dashboard
      - button "Day planner" [ref=e21] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e28]: Explore
      - button "Packing list" [ref=e29] [cursor=pointer]:
        - img [ref=e32]
        - generic [ref=e35]: Pack
      - button "Crew" [ref=e36] [cursor=pointer]:
        - img [ref=e39]
        - generic [ref=e45]: Crew
    - generic [ref=e50]:
      - generic [ref=e51]:
        - button "Dashboard" [ref=e52] [cursor=pointer]:
          - img [ref=e54]
          - text: Dashboard
        - paragraph [ref=e57]: Test Trip · 2027
        - generic [ref=e58]:
          - heading "Day 1" [level=1] [ref=e59]
          - generic [ref=e60]:
            - button "AI suggestions" [ref=e61] [cursor=pointer]:
              - img [ref=e63]
              - text: AI suggestions
            - generic [ref=e66]:
              - button "List" [ref=e67] [cursor=pointer]
              - button "Time" [ref=e68] [cursor=pointer]
        - paragraph [ref=e69]: Tue, Jun 1 · 2 events · 19h 30m free
        - generic [ref=e70]:
          - button "Jun 1" [ref=e71] [cursor=pointer]
          - button "Jun 2" [ref=e72] [cursor=pointer]
          - button "Jun 3" [ref=e73] [cursor=pointer]
      - generic [ref=e76]:
        - list [ref=e77]:
          - listitem [ref=e78]:
            - generic "Drag to reorder" [ref=e79]:
              - img [ref=e81]
            - generic [ref=e84]:
              - button "09:00 ↓ 11:00 Morning Museum Central Park Museum" [ref=e85] [cursor=pointer]:
                - generic [ref=e86]:
                  - generic [ref=e87]: 09:00
                  - generic [ref=e88]: ↓
                  - generic [ref=e89]: 11:00
                - img [ref=e90]
                - generic [ref=e103]:
                  - generic [ref=e104]: Morning Museum
                  - generic [ref=e105]:
                    - img [ref=e107]
                    - text: Central Park
                  - generic [ref=e111]: Museum
                - img [ref=e114]
              - generic [ref=e117]:
                - generic [ref=e120]:
                  - generic [ref=e121]: Duration
                  - generic [ref=e122]: 09:00–11:00 (2h)
                - generic [ref=e123]:
                  - button "Edit" [ref=e124] [cursor=pointer]:
                    - img [ref=e126]
                    - generic [ref=e129]: Edit
                  - button "Reschedule" [ref=e130] [cursor=pointer]:
                    - img [ref=e132]
                    - generic [ref=e136]: Reschedule
                  - button "AI suggest" [ref=e137] [cursor=pointer]:
                    - img [ref=e139]
                    - generic [ref=e142]: AI suggest
                  - button "Delete" [ref=e143] [cursor=pointer]:
                    - img [ref=e145]
                    - generic [ref=e148]: Delete
          - listitem [ref=e149]:
            - generic "Drag to reorder" [ref=e150]:
              - img [ref=e152]
            - generic [ref=e155]:
              - button "13:00 ↓ 14:30 Lunch at Joe's Food" [ref=e156] [cursor=pointer]:
                - generic [ref=e157]:
                  - generic [ref=e158]: 13:00
                  - generic [ref=e159]: ↓
                  - generic [ref=e160]: 14:30
                - img [ref=e161]
                - generic [ref=e170]:
                  - generic [ref=e171]: Lunch at Joe's
                  - generic [ref=e172]: Food
                - img [ref=e175]
              - generic [ref=e178]:
                - generic [ref=e181]:
                  - generic [ref=e182]: Duration
                  - generic [ref=e183]: 13:00–14:30 (1h 30m)
                - generic [ref=e184]:
                  - button "Edit" [ref=e185] [cursor=pointer]:
                    - img [ref=e187]
                    - generic [ref=e190]: Edit
                  - button "Reschedule" [ref=e191] [cursor=pointer]:
                    - img [ref=e193]
                    - generic [ref=e197]: Reschedule
                  - button "AI suggest" [ref=e198] [cursor=pointer]:
                    - img [ref=e200]
                    - generic [ref=e203]: AI suggest
                  - button "Delete" [ref=e204] [cursor=pointer]:
                    - img [ref=e206]
                    - generic [ref=e209]: Delete
        - button "Stay Add hotel / accommodation" [ref=e210] [cursor=pointer]:
          - img [ref=e211]
          - generic [ref=e226]:
            - generic [ref=e227]: Stay
            - paragraph [ref=e228]: Add hotel / accommodation
          - img [ref=e230]
        - button "Add an event" [ref=e233] [cursor=pointer]:
          - img [ref=e235]
          - text: Add an event
  - button "Open Next.js Dev Tools" [ref=e243] [cursor=pointer]:
    - img [ref=e244]
  - alert [ref=e249]
```