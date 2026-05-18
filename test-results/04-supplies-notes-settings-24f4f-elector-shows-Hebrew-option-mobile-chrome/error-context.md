# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-supplies-notes-settings.spec.ts >> Settings screen >> settings: language selector shows Hebrew option
- Location: tests\04-supplies-notes-settings.spec.ts:228:7

# Error details

```
Test timeout of 35000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 35000ms exceeded.
Call log:
  - waiting for locator('[data-tour="nav-settings"]').first()
    - locator resolved to <button tabindex="0" data-tour="nav-settings">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    61 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - button "Dashboard" [ref=e5] [cursor=pointer]:
          - img [ref=e8]
          - generic [ref=e14]: Dashboard
        - button "Explore" [ref=e15] [cursor=pointer]:
          - img [ref=e17]
          - generic [ref=e21]: Explore
        - button "Pack" [ref=e22] [cursor=pointer]:
          - img [ref=e24]
          - generic [ref=e27]: Pack
        - button "Settings" [ref=e28] [cursor=pointer]:
          - img [ref=e30]
          - generic [ref=e34]: Settings
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]:
          - paragraph [ref=e43]: Current Trip
          - generic [ref=e44]:
            - generic [ref=e45]:
              - generic [ref=e46]: YO
              - generic [ref=e47]: DA
              - generic [ref=e48]: MI
            - button [ref=e50] [cursor=pointer]:
              - img [ref=e52]
        - generic [ref=e55]:
          - generic [ref=e56]:
            - heading "Negev Desert Adventure" [level=1] [ref=e57]
            - generic [ref=e58]: 🗓 57d
          - paragraph [ref=e59]:
            - text: 4 days
            - generic [ref=e60]: · 15 events
            - generic [ref=e61]: · Hi, Traveler 👋
        - generic [ref=e63] [cursor=pointer]:
          - generic [ref=e64]: 🎒 Packing
          - generic [ref=e65]: 7/14 · 50%
      - generic [ref=e68]:
        - generic [ref=e69]:
          - paragraph [ref=e70]: Next Event
          - generic [ref=e72] [cursor=pointer]:
            - generic [ref=e73]: 🍽️
            - generic [ref=e74]:
              - paragraph [ref=e75]: Day 1 · Tue, Jul 14
              - paragraph [ref=e76]: Morning camp breakfast
              - paragraph [ref=e77]:
                - text: 🕐 07:00 · 1h
                - generic [ref=e78]: · 📍 Ramon Crater Base
            - img [ref=e80]
        - generic [ref=e84] [cursor=pointer]:
          - generic [ref=e85]: 🧾 Expenses
          - img [ref=e88]
        - generic [ref=e91]:
          - paragraph [ref=e92]: Trip Insights
          - generic [ref=e93]:
            - generic [ref=e94]:
              - generic [ref=e95]:
                - generic [ref=e96]: ⚡
                - generic [ref=e97]: Day 4 has free time
              - paragraph [ref=e98]: ~13h unplanned — tap AI suggestions to fill it
            - generic [ref=e99]:
              - generic [ref=e100]:
                - generic [ref=e101]: 🎒
                - generic [ref=e102]: 50% packed
              - paragraph [ref=e103]: 7 items still unpacked
        - generic [ref=e104]:
          - paragraph [ref=e105]: days
          - generic [ref=e106]:
            - generic [ref=e108] [cursor=pointer]:
              - generic [ref=e110]:
                - generic [ref=e112]: 🥾
                - generic [ref=e113]: "1"
              - generic [ref=e114]:
                - generic [ref=e115]:
                  - generic [ref=e116]: Day 1
                  - generic [ref=e117]: Tue, Jul 14
                  - generic [ref=e118]: Up Next
                - paragraph [ref=e119]: Mitzpe Ramon — Ramon Crater
                - generic [ref=e120]:
                  - generic [ref=e121]: 5 events
                  - generic [ref=e122]: 07:00 – 20:30
                  - generic [ref=e123]: ⚡ 5 gaps
              - img [ref=e126]
            - generic [ref=e130] [cursor=pointer]:
              - generic [ref=e132]:
                - generic [ref=e134]: 🌲
                - generic [ref=e135]: "2"
              - generic [ref=e136]:
                - generic [ref=e137]:
                  - generic [ref=e138]: Day 2
                  - generic [ref=e139]: Wed, Jul 15
                - paragraph [ref=e140]: Avdat Valley — Ancient Nabatean
                - generic [ref=e141]:
                  - generic [ref=e142]: 4 events
                  - generic [ref=e143]: 06:30 – 16:30
                  - generic [ref=e144]: ⚡ 4 gaps
              - img [ref=e147]
            - generic [ref=e151] [cursor=pointer]:
              - generic [ref=e153]:
                - generic [ref=e155]: 🏄
                - generic [ref=e156]: "3"
              - generic [ref=e157]:
                - generic [ref=e158]:
                  - generic [ref=e159]: Day 3
                  - generic [ref=e160]: Thu, Jul 16
                - paragraph [ref=e161]: Dead Sea — Lowest point on Earth
                - generic [ref=e162]:
                  - generic [ref=e163]: 3 events
                  - generic [ref=e164]: 08:00 – 15:30
                  - generic [ref=e165]: ⚡ 4 gaps
              - img [ref=e168]
            - generic [ref=e172] [cursor=pointer]:
              - generic [ref=e174]:
                - generic [ref=e176]: 🌲
                - generic [ref=e177]: "4"
              - generic [ref=e178]:
                - generic [ref=e179]:
                  - generic [ref=e180]: Day 4
                  - generic [ref=e181]: Fri, Jul 17
                - paragraph [ref=e182]: Timna & Eilat — Red Sea coast
                - generic [ref=e183]:
                  - generic [ref=e184]: 3 events
                  - generic [ref=e185]: 09:00 – 15:00
                  - generic [ref=e186]: ⚡ 4 gaps
              - img [ref=e189]
  - button "Open Next.js Dev Tools" [ref=e197] [cursor=pointer]:
    - img [ref=e198]
  - alert [ref=e201]
```