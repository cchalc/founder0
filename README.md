# Founder Agent 🚀

> An autonomous AI that transforms ideas into launched products — automatically.

**Give it a vision. Watch it build, deploy, and market a real product in minutes.**

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://founder0.vercel.app)
[![Status](https://img.shields.io/badge/Status-Production-blue)](https://github.com/cchalc/founder0)

---

## The Problem We're Solving

**Launching a product is too hard.** Even with modern tools, founders face countless barriers:

- Setting up repositories and infrastructure
- Writing boilerplate code
- Configuring payments and deployments
- Creating marketing content
- Posting to social media
- Sending outreach emails

This takes **days or weeks** of work before you can even validate an idea. By the time you launch, momentum is lost.

**What if an AI could do all of this in minutes?**

---

## Our Solution: The Autonomous Founder

Founder Agent is the **first AI that autonomously launches real products from a single prompt.**

### What It Does

```
"Build a task management app for remote teams"
          ↓
    [Agent thinks...]
          ↓
✅ Full codebase scaffolded
✅ Deployed to production URL
✅ GitHub repository created
✅ Marketing strategy generated
✅ Posted on X/Twitter
✅ Outreach emails sent
```

**No human intervention required.** Just provide the vision.

---

## Innovation: Why This Is Different

### 🧠 True Autonomy
- **Not a chatbot.** The agent makes decisions, writes code, runs commands, and deploys — all on its own.
- **Multi-step reasoning.** Plans → executes → verifies → adapts → continues.
- **Real-world actions.** Controls a browser, posts to social media, sends emails, pushes to GitHub.

### 🔧 End-to-End Pipeline
Most AI tools help with *one* part of launching. We built the **complete pipeline:**

1. **Research** — Analyzes the market and target audience
2. **Build** — Generates production-ready code with Next.js, Stripe integration
3. **Deploy** — Pushes to Vercel with a live URL
4. **Market** — Posts launch tweets and creates content strategy
5. **Outreach** — Sends professional emails to potential customers

### 🎯 Concrete Outcomes
- **Live websites** you can visit
- **Real GitHub repos** with commit history
- **Social media posts** on X/Twitter
- **Professional outreach emails** ready to send
- **Strategic plans** for growth, monetization, SEO

---

## Design & User Experience

### Live Dashboard: Watch Your Product Come to Life

Real-time event stream shows every decision the agent makes:

```
🤖 Planning project structure...
📝 Creating Next.js application...
⚡ Installing dependencies...
🚀 Deploying to Vercel...
✅ Live at: https://taskflow-ai.vercel.app
🐦 Posting launch tweet...
📧 Sending outreach emails...
```

**Transparent. Trustworthy. Exciting.**

### Intuitive Workflow

```
1. Enter your product vision → One text input
2. Click "Launch" → One button
3. Watch the magic → Real-time dashboard
4. Get your product → Live URL + GitHub repo
```

**Simple enough for non-technical founders. Powerful enough for experienced builders.**

### Requirements Chat Interface

Not sure what to build? Our AI-powered chat helps you:
- Discover product ideas
- Define features and scope
- Identify target audiences
- Generate complete product specs

**From vague idea to concrete specification in minutes.**

---

## Real-World Impact

### 🚀 Democratizing Entrepreneurship

**Before Founder Agent:**
- Weeks of setup before launch
- Need technical skills or expensive developers
- High barrier to testing ideas
- Most ideas never ship

**After Founder Agent:**
- Launch in minutes
- No coding required
- Test 10 ideas in the time it used to take to build one
- Ship fast, learn fast

### 💡 Accelerating Innovation

**Founders can now:**
- Validate ideas immediately
- Test multiple variations quickly
- Focus on strategy instead of implementation
- Go from idea to customer feedback in hours

### 🌍 Use Cases

- **Solo founders** launching MVPs
- **Startup studios** testing business ideas
- **Agencies** prototyping for clients
- **Educators** teaching entrepreneurship
- **Hackers** building weekend projects

---

## How It Works (Technical Overview)

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend Dashboard                  │
│           (Next.js 16 + Real-time Events)           │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              Backend Agent Server                    │
│         (Express + Claude Agent SDK)                 │
└─────────────────┬───────────────────────────────────┘
                  │
          ┌───────┴───────┐
          │               │
┌─────────▼──────┐  ┌────▼──────────┐
│  Code & Deploy │  │ Browser Agent │
│  • File Ops    │  │ • Browserbase │
│  • Git/GitHub  │  │ • X/Twitter   │
│  • Vercel CLI  │  │ • Stagehand   │
└────────────────┘  └───────────────┘
          │               │
┌─────────▼───────────────▼───────┐
│      Email & Outreach            │
│   • AgentMail API                │
│   • Professional Templates       │
└──────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Agent Brain** | Claude Agent SDK | Autonomous reasoning + tool use |
| **Browser Control** | Browserbase + Stagehand | Real browser automation for social media |
| **Frontend** | Next.js 16 (App Router) | Modern React with SSE for real-time updates |
| **Backend** | Express + Server-Sent Events | Event streaming to dashboard |
| **Deployment** | Vercel CLI | Instant production deployments |
| **Email** | AgentMail | Automated customer outreach |
| **Version Control** | GitHub CLI | Automated repo creation and pushes |

### The Agent Loop

```python
while not done:
    1. Analyze current state
    2. Pick next action (write file, run command, deploy, post, email)
    3. Execute with available tools
    4. Stream event to dashboard
    5. Evaluate result
    6. Decide next step
```

**Autonomous execution. Human oversight. Real results.**

---

## Live Demo

### Try It Now

1. **Visit:** [https://founder0.vercel.app](https://founder0.vercel.app)
2. **Enter a product idea** (e.g., "AI-powered recipe app for busy parents")
3. **Click Launch**
4. **Watch it build** in real-time

### What You'll Get

- 📦 **Complete codebase** with Next.js, Tailwind, TypeScript
- 🌐 **Live production URL** (e.g., `recipegenie.vercel.app`)
- 📝 **Strategic plans** (marketing, monetization, launch checklist)
- 🐙 **GitHub repository** with full commit history
- 🐦 **Social media content** posted to X
- 📧 **Outreach emails** sent to test recipients

---

## Getting Started (For Developers)

### Prerequisites

```bash
# Required
Node.js 18+
npm or pnpm

# API Keys (add to .env)
ANTHROPIC_API_KEY=       # Claude AI
BROWSERBASE_API_KEY=     # Browser automation
AGENTMAIL_API_KEY=       # Email sending
GITHUB_TOKEN=            # Repository creation
```

### Installation

```bash
# Clone the repository
git clone https://github.com/cchalc/founder0.git
cd founder0

# Install root dependencies (email & browser tools)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running Locally

```bash
# Terminal 1: Start the backend agent server
cd backend
npm run server     # Runs on port 3001

# Terminal 2: Start the frontend dashboard
cd frontend
npm run dev        # Runs on port 3000

# Visit http://localhost:3000
```

### Test Email Integration

```bash
# Verify email automation is working
npm run test:email

# Check these inboxes:
# - chris.chalcraft@gmail.com
# - founder0testing@gmail.com
```

---

## Project Structure

```
founder0/
├── backend/                      # Agent server
│   ├── agent-core/              # Core agent logic
│   │   ├── pipeline.ts          # Main execution loop
│   │   ├── prompt.ts            # System prompt (the "founder playbook")
│   │   └── config.ts            # Environment configuration
│   ├── server.ts                # Express API + SSE streaming
│   └── output/current/          # Generated projects
│
├── frontend/                     # Dashboard UI
│   └── src/app/
│       ├── page.tsx             # Homepage
│       ├── dashboard/           # Live agent monitoring
│       ├── chat/                # Requirements gathering
│       └── api/                 # Next.js API routes
│
├── src/                         # Shared tools
│   ├── browser/                 # Browserbase automation
│   │   └── actions/            # X posting, signups, navigation
│   └── email/                   # Email outreach
│       ├── agent-email.ts      # Sending API
│       ├── outreach-generator.ts  # Email templates
│       └── test-automation.ts  # Email tests
│
└── projects/                    # Generated specs
    ├── spec.md                  # Product specifications
    └── *-outreach-*.md         # Marketing emails
```

---

## Judging Criteria Alignment

### 🎨 Innovation

- **First autonomous AI founder** that handles the complete launch pipeline
- **Browser control** for social media actions (not just API calls)
- **Multi-agent architecture** combining code generation, deployment, and marketing
- **Real-world validation** through actual deployments and social posts

### 🎯 Design & UX

- **Real-time dashboard** with transparent agent decision-making
- **One-click launches** from idea to production
- **Guided requirements chat** for non-technical users
- **Professional outputs** (clean code, marketing content, emails)

### 🌍 Real-World Impact

- **Reduces launch time from weeks to minutes**
- **Removes technical barriers** to entrepreneurship
- **Enables rapid idea validation** and iteration
- **Democratizes access** to startup infrastructure

### 📊 Clear Presentation

- **Simple mental model:** Idea → Agent → Launched Product
- **Visible progress:** Every action streamed to dashboard
- **Concrete outcomes:** Live URLs, repos, posts, emails
- **Reproducible results:** Run it again, get another product

---

## What Makes This Special

### It Actually Works

This isn't a demo. Every agent run:
- ✅ Creates real Git commits
- ✅ Deploys to real URLs
- ✅ Posts to real social media
- ✅ Sends real emails

**No smoke and mirrors. No hard-coded examples. Real automation.**

### It's Autonomous

The agent decides:
- What tech stack to use
- How to structure the code
- What features to build first
- How to market the product
- What to include in outreach emails

**You provide the vision. The agent makes it real.**

### It's Extensible

Built on Claude Agent SDK, the system can be extended with:
- More deployment targets (AWS, Netlify, Railway)
- Additional marketing channels (Reddit, Product Hunt, LinkedIn)
- Advanced monetization (Stripe subscriptions, usage-based billing)
- Custom tools for specific verticals

**This is just the beginning.**

---

## Future Roadmap

### Phase 1: Enhanced Intelligence ✅ (Current)
- ✅ Autonomous product building
- ✅ Automated deployment
- ✅ Social media marketing
- ✅ Email outreach

### Phase 2: Advanced Features (Next)
- 🔄 Multi-platform deployment (AWS, Cloudflare)
- 🔄 A/B testing automation
- 🔄 SEO optimization
- 🔄 Customer feedback analysis

### Phase 3: Ecosystem (Future)
- 🔮 Marketplace for agent plugins
- 🔮 Template library for common products
- 🔮 Team collaboration features
- 🔮 Analytics dashboard

---

## Team

Built in 4 hours by a team passionate about AI and entrepreneurship.

**Contributors:**
- **Agent Core** — Autonomous reasoning and execution
- **Browser Automation** — Social media integration
- **Email System** — Customer outreach
- **Dashboard** — Real-time visualization

---

## Links

- **Live Demo:** [https://founder0.vercel.app](https://founder0.vercel.app)
- **GitHub:** [https://github.com/cchalc/founder0](https://github.com/cchalc/founder0)
- **Documentation:** [AGENT_EMAIL_INTEGRATION.md](./AGENT_EMAIL_INTEGRATION.md)

---

## License

MIT License - Build anything you want with this.

---

**The future of entrepreneurship is autonomous.**

**Give your AI an idea. Get a launched product.**

**Welcome to Founder Agent.** 🚀
