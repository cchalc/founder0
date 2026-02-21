"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  Globe,
  Terminal,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Monitor,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Rocket,
  Send,
  Mail,
  Search,
  GitBranch,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  ArrowUpRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const PREVIEW_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? "http://localhost:4000";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface AgentEvent {
  type: "assistant_text" | "tool_use" | "tool_result" | "result" | "error" | "done";
  content?: string;
  timestamp?: string;
}

interface PreviewStatus {
  running: boolean;
  ready: boolean;
  port: number;
  url: string;
}

interface RunInfo {
  exists: boolean;
  vision?: string;
  status?: string;
  startedAt?: string;
  completedAt?: string;
}

interface ActivityItem {
  id: string;
  type: "deploy" | "social" | "email" | "research" | "code" | "payment";
  title: string;
  detail: string;
  timestamp: string;
  url?: string;
}

interface BusinessSummary {
  company: {
    name: string;
    tagline: string;
    problem: string;
    solution: string;
    businessModel: string;
    targetMarket: string;
  };
  metrics: {
    activeUsers: number;
    revenue: number;
    deployments: number;
    socialPosts: number;
    emailsSent: number;
    pageViews: number;
  };
  activity: ActivityItem[];
  userGrowth: { date: string; users: number }[];
}

type RunStatus = "idle" | "running" | "completed" | "error";

/* ------------------------------------------------------------------ */
/* Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_SUMMARY: BusinessSummary = {
  company: {
    name: "DepFlow",
    tagline: "Visualize code dependencies like never before",
    problem:
      "Engineering teams waste 15+ hours/week understanding unfamiliar codebases. Dependency graphs are invisible, making refactors risky and onboarding slow.",
    solution:
      "Drag-and-drop flowchart builder that auto-parses JavaScript, TypeScript, and Python imports into interactive visual graphs. Upload code, see the architecture instantly.",
    businessModel:
      "Freemium SaaS — Free tier (1 project, community support), Pro at $29/mo (unlimited projects, GitHub integration), Team at $79/mo (collaboration, SSO, audit logs).",
    targetMarket:
      "Senior engineers maintaining legacy codebases, engineering managers onboarding developers, open-source maintainers documenting architecture.",
  },
  metrics: {
    activeUsers: 47,
    revenue: 0,
    deployments: 1,
    socialPosts: 3,
    emailsSent: 12,
    pageViews: 842,
  },
  activity: [
    {
      id: "1",
      type: "code",
      title: "Scaffolded Next.js project",
      detail: "Created landing page, interactive editor with ReactFlow, Zustand state management, and code parser.",
      timestamp: "2026-02-21T10:02:00Z",
    },
    {
      id: "2",
      type: "deploy",
      title: "Deployed to Vercel",
      detail: "Live at depflow.vercel.app — landing page, editor, and example gallery all functional.",
      timestamp: "2026-02-21T10:08:00Z",
      url: "https://depflow.vercel.app",
    },
    {
      id: "3",
      type: "payment",
      title: "Stripe products created",
      detail: "Set up 3 pricing tiers: Starter (free), Pro ($29/mo), Team ($79/mo) with Stripe Checkout.",
      timestamp: "2026-02-21T10:12:00Z",
    },
    {
      id: "4",
      type: "social",
      title: 'Posted on X',
      detail: '"Just launched DepFlow — turn your codebase into interactive dependency flowcharts. Upload JS/TS/Python and see your architecture instantly. Free to try."',
      timestamp: "2026-02-21T10:15:00Z",
    },
    {
      id: "5",
      type: "research",
      title: "Competitive analysis completed",
      detail: "Analyzed Madge, dependency-cruiser, and CodeSee. Key differentiator: interactive editing + multi-language support.",
      timestamp: "2026-02-21T10:20:00Z",
    },
    {
      id: "6",
      type: "email",
      title: "Outreach emails sent",
      detail: "Sent personalized intro emails to 12 developer tool reviewers and newsletter editors.",
      timestamp: "2026-02-21T10:25:00Z",
    },
    {
      id: "7",
      type: "social",
      title: "Posted on r/programming",
      detail: '"Show HN-style post: DepFlow — open-source code dependency visualizer with drag-and-drop editing"',
      timestamp: "2026-02-21T10:30:00Z",
    },
    {
      id: "8",
      type: "social",
      title: "Posted launch thread on X",
      detail: "5-tweet thread covering the problem, demo GIF, tech stack, and call-to-action.",
      timestamp: "2026-02-21T10:35:00Z",
    },
  ],
  userGrowth: [
    { date: "Day 1", users: 12 },
    { date: "Day 2", users: 28 },
    { date: "Day 3", users: 47 },
    { date: "Day 4", users: 63 },
    { date: "Day 5", users: 89 },
    { date: "Day 6", users: 124 },
    { date: "Day 7", users: 156 },
  ],
};

/* ------------------------------------------------------------------ */
/* Page root                                                          */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "app", label: "App", icon: Globe },
  { id: "business", label: "Business", icon: BarChart3 },
] as const;

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const isNewRun = searchParams.get("new") === "1";

  const [activeTab, setActiveTab] = useState<string>("app");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus | null>(null);
  const [runInfo, setRunInfo] = useState<RunInfo | null>(null);
  const [summary, setSummary] = useState<BusinessSummary>(MOCK_SUMMARY);
  const feedRef = useRef<HTMLDivElement>(null);
  const streamConnected = useRef(false);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/runs/current/summary`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists && data.summary) {
          setSummary(data.summary);
        }
      }
    } catch {
      // summary not available, keep mock
    }
  }, []);

  const connectStream = useCallback(() => {
    if (streamConnected.current) return;
    streamConnected.current = true;

    const eventSource = new EventSource(`${API_URL}/api/runs/current/stream`);

    eventSource.onmessage = (e) => {
      const event: AgentEvent = JSON.parse(e.data);

      if (event.type === "done") {
        setStatus((prev) => (prev === "running" ? "completed" : prev));
        eventSource.close();
        streamConnected.current = false;
        pollPreview();
        fetchSummary();
        return;
      }

      if (event.type === "error") {
        setStatus("error");
      }

      setEvents((prev) => [...prev, event]);
    };

    eventSource.onerror = () => {
      eventSource.close();
      streamConnected.current = false;
      setStatus((prev) => (prev === "running" ? "error" : prev));
    };
  }, [fetchSummary]);

  const pollPreview = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/runs/current/preview-status`);
        if (res.ok) {
          const data: PreviewStatus = await res.json();
          setPreviewStatus(data);
          if (data.ready) clearInterval(interval);
        }
      } catch {
        // not ready
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API_URL}/api/runs/current`);
        if (res.ok) {
          const info: RunInfo = await res.json();
          setRunInfo(info);

          if (info.exists) {
            if (info.status === "running" || isNewRun) {
              setStatus("running");
              connectStream();
            } else if (info.status === "completed") {
              setStatus("completed");
              pollPreview();
              fetchSummary();
            } else if (info.status === "error") {
              setStatus("error");
            }
          }
        }
      } catch {
        // backend unreachable
      }
    }
    init();
  }, [isNewRun, connectStream, pollPreview, fetchSummary]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const statusConfig: Record<RunStatus, { color: string; label: string }> = {
    idle: { color: "bg-amber-500/80", label: "Idle" },
    running: { color: "bg-emerald-500", label: "Running" },
    completed: { color: "bg-blue-500", label: "Completed" },
    error: { color: "bg-red-500", label: "Error" },
  };

  const { color, label } = statusConfig[status];

  return (
    <div className="flex h-screen flex-col bg-[#030303]">
      {/* Nav */}
      <header className="shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-white/90 hover:text-white transition-colors"
            >
              Founder Agent
            </Link>
            <nav className="flex gap-0.5">
              {TABS.map(({ id, label: tabLabel, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === id
                      ? "bg-white/[0.08] text-white/90"
                      : "text-white/35 hover:text-white/55 hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tabLabel}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {runInfo?.vision && (
              <span className="max-w-[250px] truncate text-[11px] text-white/25 font-mono">
                {runInfo.vision}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${color} ${
                  status === "running" ? "animate-pulse" : ""
                }`}
              />
              <span className="text-[10px] font-mono tracking-wider text-white/30 uppercase">
                {label}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "app" ? (
          <AppTabContent
            events={events}
            status={status}
            previewStatus={previewStatus}
            feedRef={feedRef}
          />
        ) : (
          <BusinessTabContent summary={summary} status={status} />
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* APP TAB                                                            */
/* ================================================================== */

function AppTabContent({
  events,
  status,
  previewStatus,
  feedRef,
}: {
  events: AgentEvent[];
  status: RunStatus;
  previewStatus: PreviewStatus | null;
  feedRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <div className="flex h-full">
      <div className="w-[360px] shrink-0 flex flex-col border-r border-white/[0.06]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <Bot className="size-3.5 text-white/30" />
          <span className="text-xs font-medium text-white/60">Agent Feed</span>
          {status === "running" && (
            <Loader2 className="ml-auto size-3 animate-spin text-emerald-400/70" />
          )}
        </div>

        <div ref={feedRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {events.length === 0 && status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Bot className="size-7 text-white/[0.08] mb-3" />
              <p className="text-[13px] text-white/25">No active run</p>
              <p className="text-[11px] text-white/15 mt-1">
                Launch from the home page.
              </p>
            </div>
          )}
          {events.length === 0 && status === "running" && (
            <div className="flex items-center gap-2 justify-center py-10">
              <Loader2 className="size-3.5 animate-spin text-white/20" />
              <span className="text-[11px] text-white/20">Waiting for agent…</span>
            </div>
          )}
          {events.map((event, i) => (
            <FeedItem key={i} event={event} index={i} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#070707]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
          <div className="flex items-center gap-2">
            <Monitor className="size-3.5 text-white/30" />
            <span className="text-xs font-medium text-white/60">Preview</span>
          </div>
          {previewStatus?.ready && (
            <div className="flex items-center gap-3">
              <a
                href={PREVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors"
              >
                <ExternalLink className="size-3" />
                Open
              </a>
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors"
              >
                <RefreshCw className="size-3" />
                Refresh
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          {!previewStatus?.ready ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {status === "running" ? (
                <>
                  <Loader2 className="size-6 animate-spin text-white/[0.08] mb-3" />
                  <p className="text-[13px] text-white/25">Building your app…</p>
                </>
              ) : status === "completed" ? (
                <>
                  <Loader2 className="size-6 animate-spin text-white/[0.08] mb-3" />
                  <p className="text-[13px] text-white/25">Starting preview…</p>
                </>
              ) : status === "error" ? (
                <>
                  <AlertCircle className="size-6 text-red-400/30 mb-3" />
                  <p className="text-[13px] text-white/25">Build failed</p>
                </>
              ) : (
                <>
                  <Monitor className="size-6 text-white/[0.06] mb-3" />
                  <p className="text-[13px] text-white/20">No app to preview</p>
                </>
              )}
            </div>
          ) : (
            <iframe
              key={iframeKey}
              src={PREVIEW_URL}
              className="absolute inset-0 w-full h-full border-0 bg-white"
              title="App Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* BUSINESS TAB                                                       */
/* ================================================================== */

const ACTIVITY_ICONS: Record<ActivityItem["type"], React.ElementType> = {
  deploy: Rocket,
  social: Send,
  email: Mail,
  research: Search,
  code: GitBranch,
  payment: DollarSign,
};

const ACTIVITY_COLORS: Record<ActivityItem["type"], string> = {
  deploy: "text-cyan-400 bg-cyan-400/10",
  social: "text-violet-400 bg-violet-400/10",
  email: "text-amber-400 bg-amber-400/10",
  research: "text-emerald-400 bg-emerald-400/10",
  code: "text-sky-400 bg-sky-400/10",
  payment: "text-pink-400 bg-pink-400/10",
};

function BusinessTabContent({
  summary,
  status,
}: {
  summary: BusinessSummary;
  status: RunStatus;
}) {
  const maxUsers = Math.max(...summary.userGrowth.map((d) => d.users), 1);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Company header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            {summary.company.name}
          </h1>
          <p className="mt-1 text-sm text-white/35">{summary.company.tagline}</p>
        </motion.div>

        {/* Metric cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          <MetricCard icon={Users} label="Active Users" value={summary.metrics.activeUsers} />
          <MetricCard icon={DollarSign} label="Revenue" value={`$${summary.metrics.revenue}`} />
          <MetricCard icon={Rocket} label="Deployments" value={summary.metrics.deployments} />
          <MetricCard icon={Send} label="Social Posts" value={summary.metrics.socialPosts} />
          <MetricCard icon={Mail} label="Emails Sent" value={summary.metrics.emailsSent} />
          <MetricCard icon={TrendingUp} label="Page Views" value={summary.metrics.pageViews} />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Activity timeline -- spans 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <Zap className="size-4 text-white/30" />
              <h2 className="text-sm font-medium text-white/70">Agent Activity</h2>
              <span className="ml-auto text-[10px] font-mono text-white/20 uppercase">
                {summary.activity.length} actions
              </span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {summary.activity.map((item, i) => {
                const Icon = ACTIVITY_ICONS[item.type];
                const colorClass = ACTIVITY_COLORS[item.type];

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.12 + i * 0.03 }}
                    className="flex gap-3 px-5 py-3.5 group hover:bg-white/[0.015] transition-colors"
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white/75">
                          {item.title}
                        </span>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowUpRight className="size-3 text-white/25 hover:text-white/50" />
                          </a>
                        )}
                      </div>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-white/30 line-clamp-2">
                        {item.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-white/15 mt-1">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {status === "running" && (
              <div className="flex items-center gap-2 px-5 py-3 border-t border-white/[0.04]">
                <Loader2 className="size-3 animate-spin text-white/15" />
                <span className="text-[11px] text-white/20">Agent is still working…</span>
              </div>
            )}
          </motion.div>

          {/* Right column: business info + chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Business info cards */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
              <InfoBlock label="Problem" content={summary.company.problem} />
              <InfoBlock label="Solution" content={summary.company.solution} />
              <InfoBlock label="Business Model" content={summary.company.businessModel} />
              <InfoBlock label="Target Market" content={summary.company.targetMarket} />
            </div>

            {/* User growth chart */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
                <TrendingUp className="size-4 text-white/30" />
                <h2 className="text-sm font-medium text-white/70">User Growth</h2>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-end gap-2 h-28">
                  {summary.userGrowth.map((point, i) => {
                    const pct = (point.users / maxUsers) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-mono text-white/20">
                          {point.users}
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(pct, 4)}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
                          className="w-full rounded-t-sm bg-gradient-to-t from-cyan-500/40 to-cyan-400/80"
                        />
                        <span className="text-[8px] text-white/15 font-mono">
                          {point.date.replace("Day ", "D")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="size-3 text-white/20" />
        <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-xl font-bold tracking-tight text-white/85 font-mono">
        {value}
      </span>
    </div>
  );
}

function InfoBlock({ label, content }: { label: string; content: string }) {
  return (
    <div className="px-5 py-3.5">
      <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
        {label}
      </span>
      <p className="mt-1.5 text-[12px] leading-relaxed text-white/50">{content}</p>
    </div>
  );
}

/* ================================================================== */
/* FEED ITEM                                                          */
/* ================================================================== */

function FeedItem({ event, index }: { event: AgentEvent; index: number }) {
  const iconMap: Record<string, React.ReactNode> = {
    assistant_text: <Terminal className="size-3 shrink-0 text-emerald-400/70" />,
    tool_use: <Wrench className="size-3 shrink-0 text-blue-400/70" />,
    result: <CheckCircle2 className="size-3 shrink-0 text-blue-400/70" />,
    error: <AlertCircle className="size-3 shrink-0 text-red-400/70" />,
  };

  const labelMap: Record<string, string> = {
    assistant_text: "Agent",
    tool_use: "Tool",
    result: "Result",
    error: "Error",
  };

  const truncated =
    event.type === "assistant_text" && event.content && event.content.length > 180
      ? event.content.slice(0, 180) + "…"
      : event.content;

  return (
    <motion.div
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12 }}
      className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
    >
      <div className="flex items-center gap-1.5">
        {iconMap[event.type]}
        <span className="text-[10px] font-mono text-white/40">
          {labelMap[event.type] ?? event.type} #{index + 1}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-white/30 leading-relaxed break-words">
        {truncated}
      </p>
    </motion.div>
  );
}
