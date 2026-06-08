# Welcome to Trippy

## How We Use Claude

Based on usage over the last 30 days (178 sessions):

```
Work Type Breakdown:
  Build Feature   ████████████████░░░░  68%
  Debug Fix       ████░░░░░░░░░░░░░░░░  20%
  Plan Design     ██░░░░░░░░░░░░░░░░░░   8%
  Other           █░░░░░░░░░░░░░░░░░░░   4%
```

We mostly use Claude to build and ship — long, rolling sessions that carry context
across big feature work. Debugging is the second biggest use: paste an error, get
a fix. Design sessions happen when we're planning a new screen or rethinking a flow.

```
Top MCP Servers:
  ccd_session     █░░░░░░░░░░░░░░░░░░░   1 call
```

---

## Your Setup Checklist

### Codebases
- [ ] **trippy** — github.com/s61821333-ux/trippy

### MCP Servers to Activate
- [ ] **ccd_session** — Used for session continuity. Ask the team how to configure it locally.

### Skills to Know About
- `/supabase` — Used for any database, auth, or edge function work. Pulls in Supabase-aware context so Claude doesn't guess at the API.
- `/code-review` — Run before opening a PR. Catches correctness bugs and cleanup opportunities in the diff.
- `/verify` — Confirms a fix actually works in the running app, not just in theory.
- `/run` — Starts the dev server and lets Claude interact with the app directly.
- `/security-review` — Full security audit of pending branch changes. Worth running before any auth or API surface work.

---

## Team Tips

_TODO_

---

## Get Started

_TODO_

---

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
