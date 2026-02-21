# Founder Agent — 4 People, 4 Hours

## The Pitch
Autonomous AI agent that builds + launches a real B2C product from a single prompt. It writes code, deploys, sets up payments, and posts on X — all on its own.

## Stack
- **Claude Agent SDK** — agent loop + file/bash tools (free via Claude Code sub)
- **Browserbase + Stagehand** — agent controls real Chrome (posts on X, navigates sites)
- **Stripe** — real payments, judges can buy the product
- **Vercel** — agent deploys via `vercel --prod` through bash tool
- **Supabase** — live dashboard of agent decisions

## Signup (10 min, all parallel)
| Person A | Vercel (`npm i -g vercel && vercel login`) |
|----------|---------------------------------------------|
| Person B | Browserbase |
| Person C | Stripe (test mode) |
| Person D | Supabase + burner X account |

No Anthropic API key needed — Agent SDK uses your Claude Code subscription.

---

## Person A — Agent Core

**Hour 1:** Install Agent SDK. Write a test: agent creates a file + runs a bash command. Confirm it works. Start drafting the system prompt (founder playbook: research → build → deploy → monetize → market).

**Hour 2:** Register custom tools from B and C. Write the full system prompt with Person C. Do a dry run — agent builds a site + deploys to Vercel with just Write/Bash tools.

**Hour 3:** Wire in browser tool from Person B. Full integration run. Debug the prompt — this is where things break.

**Hour 4:** Final demo run. Tune prompt.

---

## Person B — Browser Tool (Browserbase + Stagehand)

**Hour 1:** Set up Browserbase. Get a session launching. Test Stagehand `act("click the login button")` on a simple site.

**Hour 2:** Build the `browser_action` MCP tool. Test: log into burner X account + post a tweet. Handle errors (don't crash on failure).

**Hour 3:** Hand tool to Person A. Help integrate + debug. Test Reddit posting if time.

**Hour 4:** Make sure Browserbase session replays are recorded. This is your demo proof footage.

---

## Person C — Stripe Tool + Co-pilot

**Hour 1:** Build `create_checkout` tool (Stripe SDK → returns payment URL). Test with card `4242 4242 4242 4242`. Build `log_turn` tool (writes to Supabase turns table).

**Hour 2:** Tools done. Join Person A. Co-write the system prompt. Help with dry run — watch agent output, spot issues, tweak prompt.

**Hour 3:** Pair debug with Person A on full integration run. Own the Stripe flow — make sure payments work end to end.

**Hour 4:** Be ready to show Stripe dashboard during demo.

---

## Person D — Dashboard + Demo Director

**Hour 1:** Supabase: create `turns` table + `commands` table. Build a simple HTML page with realtime subscription — scrolling feed of agent decisions. Create burner X account, give creds to Person B.

**Hour 2:** Build steering: insert a command into `commands` table → agent picks it up between turns. Polish dashboard.

**Hour 3:** Become QA. Run the agent, find bugs, report. Screen-record Browserbase replays as backup. Generate QR code for deployed URL.

**Hour 4:** **Own the demo.** Run presentation, monitor dashboard, send steering command mid-run, cue QR code moment.

---

## Demo (2 min)
1. "We built an AI that autonomously launches products" → 15s
2. Live dashboard — agent decisions streaming → 30s
3. Browser replay — agent posting on X → 30s
4. Deployed site — it's real → 15s
5. Steering command — agent adapts → 15s
6. QR code — someone buys the product live → 15s

## Cut list (if behind)
1. ~~Reddit~~ → just X
2. ~~Steering~~ → hardcode the run
3. ~~Dashboard~~ → show terminal logs
4. **Never cut:** Stripe + live site + browser replay
