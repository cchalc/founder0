# AI Founder Agent — Hackathon Plan (4 people, 4 hours)

## What It Does

An autonomous AI agent that builds and launches a real B2C product in one continuous run. It researches, codes, deploys, sets up payments, and markets — all without human intervention. Humans can steer it mid-run via commands.

## The Run (what the agent does autonomously)

1. **Research** → picks a B2C product idea (or receives one from a judge)
2. **Build** → writes a landing page (single HTML file w/ Stripe checkout)
3. **Deploy** → pushes to Vercel, gets a live URL
4. **Monetize** → creates Stripe checkout session, wires payment link into the site
5. **Market** → opens X in a real browser, logs in, posts about the product. Same for Reddit.
6. **Iterate** → checks the site, fixes issues, improves copy

## Tech Stack

| Layer    | Tool              | Why |
|----------|-------------------|-----|
| Brain    | Claude API (tool_use) | Powers the agent loop — plans, reasons, picks tools |
| Browser  | Browserbase + Stagehand | Agent controls a real Chrome in the cloud. Posts on X/Reddit, navigates sites like a human. Session replays = demo proof. |
| Payments | Stripe Checkout   | Agent creates payment links. Judges can buy the product live. |
| Deploy   | Vercel CLI        | One command deploys the site. Agent gets a real public URL. |
| Dashboard | Supabase Realtime | Live feed of agent decisions. Audience watches the agent think. |

## API Keys Needed (first 10 min, sign up in parallel)

| Service   | Who   | Link |
|-----------|-------|------|
| Anthropic | Person A | console.anthropic.com |
| Browserbase | Person B | browserbase.com |
| Stripe    | Person C | dashboard.stripe.com |
| Vercel    | Person C | vercel.com |
| Supabase  | Person D | supabase.com |
| Burner X account | Person D | twitter.com (no API needed, agent logs in via browser) |

## Architecture (one loop)

```
while running:
  1. Load context (last N turns + compressed history)
  2. Claude picks a tool + explains its plan
  3. Execute the tool (write file / deploy / browse / stripe)
  4. Log result to Supabase
  5. Check for human steering commands
  6. Repeat
```

## 4-Person Split

### Person A — Agent Core

**The brain.** Owns the loop, the prompt, and the memory.

- **Hour 1:** Build the agent while-loop w/ Claude tool_use. Define tool schemas (mock responses first). Start drafting the system prompt (founder playbook: research → build → deploy → monetize → market).
- **Hour 2:** Wire in real tools from B & C. Add context compression (every ~15 turns, Claude summarizes history into a "state of the company" blob).
- **Hour 3:** First real run with Person C. Debug prompt issues together. Add human steering (check Supabase commands table between turns).
- **Hour 4:** Final demo run. Tune prompt based on what broke.

### Person B — Browser Automation

**The hardest integration.** Dedicated person for hours 1–2, then joins agent integration.

- **Hour 1:** Set up Browserbase. Get a browser session launching and navigating to a URL via Stagehand. Test act("click the login button") on a simple site.
- **Hour 2:** Build the browser_action tool function: takes a natural language instruction, executes it in Browserbase, returns what happened. Test: log into the burner X account and post a tweet.
- **Hour 3:** Integrate browser tool with Person A's agent loop. Handle failures gracefully (if a page doesn't load, return error, don't crash).
- **Hour 4:** Support demo run. Make sure Browserbase session replays are recorded — this is the "proof it's real" footage.

### Person C — Tools + Agent Co-pilot

Builds the quick tools in hour 1, then becomes Person A's second brain.

- **Hour 1:** Build write_file (create/edit files), deploy (runs vercel --prod, returns URL), create_checkout (Stripe SDK, create checkout session, return payment link). Test with card 4242 4242 4242 4242.
- **Hour 2:** Hand tools to Person A. Co-write the system prompt — this is a two-brain job. The prompt needs the right founder playbook, tool descriptions, and guardrails to keep the agent on track.
- **Hour 3:** Pair with Person A on the first real run. Debug together — fix prompt issues, handle edge cases, tune tool descriptions so the agent picks the right tool at the right time.
- **Hour 4:** All-hands debugging + demo support. Own the Stripe dashboard screen during the presentation.

### Person D — Dashboard + Demo Director + QA

Builds the dashboard, then owns everything about making the demo land.

- **Hour 1:** Supabase project: turns table (id, turn_number, plan, action, result, created_at). Build a simple HTML page with Supabase realtime subscription — scrolling feed of agent decisions.
- **Hour 2:** Set up burner X account (profile pic, bio). Build steering: commands table in Supabase, agent checks it between turns. Prep demo assets.
- **Hour 3:** Become QA — run the agent, find bugs, report to A/B/C. Screen record Browserbase session replays as backup footage. Generate QR code for the deployed URL.
- **Hour 4:** Own the demo. Run the presentation. Monitor dashboard. Send the steering command mid-run. Cue the QR code moment. Have backup recording queued if live demo breaks. **This person IS the demo.**

## Demo Script (2 min)

| Time | Moment |
|------|--------|
| 15s | "We built an AI that autonomously launches products" |
| 30s | Show live dashboard — agent's decisions streaming in real time |
| 30s | Show browser replay — agent posting on X, creating Stripe products |
| 15s | Show the deployed site — it's real, it's live |
| 15s | Send a steering command — agent adapts mid-run |
| 15s | QR code — "buy something right now" — someone pays $1 |
