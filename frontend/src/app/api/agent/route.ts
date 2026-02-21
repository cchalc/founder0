import { NextRequest } from "next/server";

const MOCK_EVENTS: Array<{
  delay: number;
  event: string;
  data: Record<string, unknown>;
}> = [
  {
    delay: 400,
    event: "message",
    data: {
      role: "agent",
      type: "thinking",
      content: "Analyzing your app spec and planning the component structure...",
    },
  },
  {
    delay: 1200,
    event: "message",
    data: {
      role: "agent",
      type: "thinking",
      content:
        "I'll build a modern landing page with a hero section, features grid, and a call-to-action.",
    },
  },
  {
    delay: 800,
    event: "file_update",
    data: {
      path: "/App.tsx",
      content: `export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">LaunchPad</span>
        <div className="flex gap-6 items-center">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition">Features</a>
          <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition">Pricing</a>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Get Started
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <span className="text-indigo-400 text-sm font-medium">Now in Beta</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
          Ship your ideas<br />
          <span className="text-indigo-400">before someone else does</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          LaunchPad turns your product vision into a deployed, monetized app — 
          powered by AI that codes, deploys, and markets for you.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition text-sm">
            Start Building Free
          </button>
          <button className="border border-slate-700 hover:border-slate-500 text-slate-300 font-medium px-6 py-3 rounded-lg transition text-sm">
            Watch Demo
          </button>
        </div>
      </main>

      <section id="features" className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to launch</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "AI Code Gen", desc: "Describe your app and watch it get built in real time." },
            { title: "One-Click Deploy", desc: "Instantly deployed to a live URL. No DevOps required." },
            { title: "Built-In Payments", desc: "Stripe checkout wired in from day one. Start earning." },
          ].map((f) => (
            <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}`,
    },
  },
  {
    delay: 600,
    event: "message",
    data: {
      role: "agent",
      type: "file_write",
      content: "Created `App.tsx` — main layout with hero, nav, and features grid.",
    },
  },
  {
    delay: 1500,
    event: "message",
    data: {
      role: "agent",
      type: "thinking",
      content: "Adding a pricing section component...",
    },
  },
  {
    delay: 1000,
    event: "file_update",
    data: {
      path: "/components/Pricing.tsx",
      content: `export default function Pricing() {
  const plans = [
    { name: "Starter", price: "$0", features: ["1 project", "Community support", "Basic analytics"] },
    { name: "Pro", price: "$29/mo", features: ["Unlimited projects", "Priority support", "Advanced analytics", "Custom domains"], popular: true },
    { name: "Team", price: "$79/mo", features: ["Everything in Pro", "Team collaboration", "SSO", "Audit logs"] },
  ];

  return (
    <section id="pricing" className="max-w-5xl mx-auto px-8 py-20">
      <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
      <p className="text-slate-400 text-center mb-12">Start free. Scale when you're ready.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={\`rounded-xl p-6 border \${
              plan.popular
                ? "bg-indigo-600/10 border-indigo-500/40"
                : "bg-slate-800/50 border-slate-700/50"
            }\`}
          >
            {plan.popular && (
              <span className="text-xs font-medium text-indigo-400 mb-3 block">Most Popular</span>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-3xl font-bold mt-2 mb-4">{plan.price}</p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-slate-400 flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              className={\`w-full py-2.5 rounded-lg text-sm font-medium transition \${
                plan.popular
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                  : "border border-slate-600 hover:border-slate-400 text-slate-300"
              }\`}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    },
  },
  {
    delay: 600,
    event: "message",
    data: {
      role: "agent",
      type: "file_write",
      content: "Created `components/Pricing.tsx` — three-tier pricing cards.",
    },
  },
  {
    delay: 800,
    event: "message",
    data: {
      role: "agent",
      type: "thinking",
      content: "Wiring the Pricing component into App.tsx...",
    },
  },
  {
    delay: 700,
    event: "file_update",
    data: {
      path: "/App.tsx",
      content: `import Pricing from "./components/Pricing";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">LaunchPad</span>
        <div className="flex gap-6 items-center">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition">Features</a>
          <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition">Pricing</a>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Get Started
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <span className="text-indigo-400 text-sm font-medium">Now in Beta</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
          Ship your ideas<br />
          <span className="text-indigo-400">before someone else does</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          LaunchPad turns your product vision into a deployed, monetized app — 
          powered by AI that codes, deploys, and markets for you.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition text-sm">
            Start Building Free
          </button>
          <button className="border border-slate-700 hover:border-slate-500 text-slate-300 font-medium px-6 py-3 rounded-lg transition text-sm">
            Watch Demo
          </button>
        </div>
      </main>

      <section id="features" className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to launch</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "AI Code Gen", desc: "Describe your app and watch it get built in real time." },
            { title: "One-Click Deploy", desc: "Instantly deployed to a live URL. No DevOps required." },
            { title: "Built-In Payments", desc: "Stripe checkout wired in from day one. Start earning." },
          ].map((f) => (
            <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Pricing />
    </div>
  );
}`,
    },
  },
  {
    delay: 500,
    event: "message",
    data: {
      role: "agent",
      type: "message",
      content: "App is ready! Landing page with hero, features, and pricing sections.",
    },
  },
  {
    delay: 300,
    event: "status",
    data: { status: "complete" },
  },
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const _prompt = body.prompt ?? "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      for (const evt of MOCK_EVENTS) {
        await new Promise((r) => setTimeout(r, evt.delay));
        send(evt.event, evt.data);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
