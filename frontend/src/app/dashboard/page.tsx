"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Globe,
  FileText,
  Mail,
  Terminal,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Monitor,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const PREVIEW_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? "http://localhost:4000";

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

const SECTIONS = [
  { id: "app", label: "App", icon: Globe },
  { id: "social", label: "Social Media", icon: MessageSquare },
  { id: "yc", label: "YC Pitch", icon: FileText },
  { id: "outreach", label: "Outreach", icon: Mail },
] as const;

type RunStatus = "idle" | "running" | "completed" | "error";

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

  const [status, setStatus] = useState<RunStatus>("idle");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [plans, setPlans] = useState<Record<string, string>>({});
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus | null>(null);
  const [runInfo, setRunInfo] = useState<RunInfo | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const streamConnected = useRef(false);

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
        fetchPlans();
        pollPreview();
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
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/runs/current/plans`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans ?? {});
      }
    } catch {
      // plans not available yet
    }
  }, []);

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
        // server not ready
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
              fetchPlans();
              pollPreview();
            } else if (info.status === "error") {
              setStatus("error");
            }
          }
        }
      } catch {
        // backend not reachable
      }
    }

    init();
  }, [isNewRun, connectStream, fetchPlans, pollPreview]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const statusConfig: Record<
    RunStatus,
    { color: string; glow: string; label: string }
  > = {
    idle: {
      color: "bg-amber-400",
      glow: "shadow-[0_0_8px_hsl(45,90%,55%,0.4)]",
      label: "Idle",
    },
    running: {
      color: "bg-[hsl(var(--glow-cyan))]",
      glow: "shadow-[0_0_8px_hsl(190,95%,60%,0.5)]",
      label: "Running",
    },
    completed: {
      color: "bg-emerald-400",
      glow: "shadow-[0_0_8px_hsl(160,80%,55%,0.4)]",
      label: "Completed",
    },
    error: {
      color: "bg-red-400",
      glow: "shadow-[0_0_8px_hsl(0,80%,55%,0.4)]",
      label: "Error",
    },
  };

  const { color, glow, label } = statusConfig[status];

  return (
    <div className="flex h-screen flex-col bg-background noise-overlay">
      {/* Subtle mesh in background */}
      <div className="mesh-bg" />

      {/* Nav */}
      <header className="relative z-20 shrink-0 border-b border-border/50 backdrop-blur-md bg-background/70">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            Founder Agent
          </Link>
          <nav className="flex items-center gap-5">
            {runInfo?.vision && (
              <span className="max-w-[300px] truncate rounded-md border border-border/40 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
                {runInfo.vision}
              </span>
            )}
            <div className="flex items-center gap-2.5 rounded-full border border-border/40 bg-muted/30 px-3 py-1.5">
              <span
                className={`h-2 w-2 rounded-full ${color} ${glow} ${
                  status === "running" ? "status-dot" : ""
                }`}
              />
              <span className="text-xs font-mono text-muted-foreground">
                {label}
              </span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <Tabs defaultValue="app" className="flex h-full flex-col">
          <div className="shrink-0 border-b border-border/50 bg-background/50 backdrop-blur-sm px-6">
            <TabsList className="h-auto justify-start gap-0 rounded-none bg-transparent p-0">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="tab-glow relative gap-2 rounded-none border-b-2 border-transparent px-5 py-3.5 text-muted-foreground transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-transparent hover:text-foreground/70"
                >
                  <Icon className="size-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* App tab: split layout */}
            <TabsContent value="app" className="mt-0 h-full">
              <AppTabContent
                events={events}
                status={status}
                previewStatus={previewStatus}
                feedRef={feedRef}
              />
            </TabsContent>

            {/* Plan-based tabs */}
            <TabsContent value="social" className="mt-0 h-full overflow-y-auto p-6">
              <PlanTab
                title="Social Media"
                icon={MessageSquare}
                plans={plans}
                matchKeys={["social-media", "social_media", "developer-outreach"]}
                fallbackDesc="Social media strategy, launch posts, and marketing copy."
                status={status}
              />
            </TabsContent>

            <TabsContent value="yc" className="mt-0 h-full overflow-y-auto p-6">
              <PlanTab
                title="YC Pitch"
                icon={FileText}
                plans={plans}
                matchKeys={["yc-application", "yc_application", "yc"]}
                fallbackDesc="YC application draft, one-pager, and pitch deck outline."
                status={status}
              />
            </TabsContent>

            <TabsContent value="outreach" className="mt-0 h-full overflow-y-auto p-6">
              <PlanTab
                title="Outreach"
                icon={Mail}
                plans={plans}
                matchKeys={[
                  "outreach",
                  "developer-outreach",
                  "seo-content",
                  "seo-strategy",
                  "seo_content",
                ]}
                fallbackDesc="Developer outreach, partnerships, SEO strategy, and cold outreach."
                status={status}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App Tab: agent feed (left) + iframe preview (right)                */
/* ------------------------------------------------------------------ */

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
      {/* Left: agent feed */}
      <div className="w-[400px] shrink-0 flex flex-col border-r border-border/50 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--glow-cyan)/0.1)] border border-[hsl(var(--glow-cyan)/0.15)]">
            <Terminal className="size-3 text-[hsl(var(--glow-cyan))]" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Agent Feed</span>
          {status === "running" && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-mono text-[hsl(var(--glow-cyan))] uppercase tracking-widest">
                Live
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--glow-cyan))] opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--glow-cyan))]" />
              </span>
            </div>
          )}
        </div>

        <div
          ref={feedRef}
          className="relative flex-1 overflow-y-auto px-3 py-3 space-y-1.5 feed-scanline"
        >
          {events.length === 0 && status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 mb-4">
                <Bot className="size-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">No active run</p>
              <p className="text-xs text-muted-foreground/50 mt-1.5">
                Launch a project from the home page to see agent activity here.
              </p>
            </div>
          )}
          {events.length === 0 && status === "running" && (
            <div className="flex flex-col items-center gap-3 justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[hsl(var(--glow-cyan)/0.15)] blur-xl" />
                <Loader2 className="relative size-6 animate-spin text-[hsl(var(--glow-cyan))]" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Initializing agent...
              </span>
            </div>
          )}
          {events.map((event, i) => (
            <FeedItem key={i} event={event} index={i} />
          ))}
        </div>
      </div>

      {/* Right: iframe preview with browser chrome */}
      <div className="flex-1 flex flex-col bg-[hsl(240,6%,4%)]">
        {/* Browser chrome bar */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5 bg-background/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Traffic light dots */}
            <div className="browser-dots flex gap-1.5">
              <span className="bg-[#ff5f57]" />
              <span className="bg-[#febc2e]" />
              <span className="bg-[#28c840]" />
            </div>
            {/* URL bar */}
            <div className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/30 px-3 py-1 min-w-[200px]">
              <Globe className="size-3 text-muted-foreground/50" />
              <span className="text-xs font-mono text-muted-foreground/60">
                {previewStatus?.ready ? "localhost:4000" : "..."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {previewStatus?.ready && (
              <>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
                >
                  <RefreshCw className="size-3" />
                  Refresh
                </button>
                <a
                  href={PREVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
                >
                  <ExternalLink className="size-3" />
                  Open
                </a>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          {!previewStatus?.ready ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center dot-grid">
              {status === "running" ? (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-[hsl(var(--glow-cyan)/0.08)] blur-2xl scale-150" />
                    <div className="relative rounded-2xl border border-border/40 bg-muted/20 p-5">
                      <Loader2 className="size-8 animate-spin text-[hsl(var(--glow-cyan)/0.5)]" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground/70">
                    Agent is building your app...
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-2 max-w-[240px]">
                    Preview will appear when the build completes.
                  </p>
                </>
              ) : status === "completed" ? (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-2xl scale-150" />
                    <div className="relative rounded-2xl border border-border/40 bg-muted/20 p-5">
                      <Loader2 className="size-8 animate-spin text-emerald-400/60" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground/70">
                    Starting preview server...
                  </p>
                </>
              ) : status === "error" ? (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-2xl scale-150" />
                    <div className="relative rounded-2xl border border-red-500/20 bg-muted/20 p-5">
                      <AlertCircle className="size-8 text-red-400/60" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground/70">
                    Build failed
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-2">
                    Check the agent feed for details.
                  </p>
                </>
              ) : (
                <>
                  <div className="relative mb-6">
                    <div className="relative rounded-2xl border border-border/30 bg-muted/10 p-5">
                      <Monitor className="size-8 text-muted-foreground/20" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground/60">
                    No app to preview yet
                  </p>
                  <p className="text-xs text-muted-foreground/30 mt-2">
                    Launch a project to see a live preview here.
                  </p>
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

/* ------------------------------------------------------------------ */
/* Plan Tab: renders matched plan markdown content                    */
/* ------------------------------------------------------------------ */

function PlanTab({
  title,
  icon: Icon,
  plans,
  matchKeys,
  fallbackDesc,
  status,
}: {
  title: string;
  icon: React.ElementType;
  plans: Record<string, string>;
  matchKeys: string[];
  fallbackDesc: string;
  status: RunStatus;
}) {
  const matched = Object.entries(plans).filter(([filename]) => {
    const name = filename.replace(".md", "").toLowerCase();
    return matchKeys.some((key) => name.includes(key));
  });

  // Also show plans that partially match the tab name
  const titleMatch = Object.entries(plans).filter(([filename]) => {
    const name = filename
      .replace(".md", "")
      .toLowerCase()
      .replace(/-/g, " ");
    return (
      name.includes(title.toLowerCase()) &&
      !matched.some(([f]) => f === filename)
    );
  });

  const allMatched = [...matched, ...titleMatch];

  if (allMatched.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="glow-card rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--glow-cyan)/0.08)] border border-[hsl(var(--glow-cyan)/0.12)]">
                <Icon className="size-3.5 text-[hsl(var(--glow-cyan))]" />
              </div>
              {title}
            </CardTitle>
            <CardDescription>{fallbackDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/40 bg-muted/15 p-10 text-center dot-grid">
              {status === "running" ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-6 animate-spin text-[hsl(var(--glow-cyan)/0.5)]" />
                  <p className="text-sm text-muted-foreground">
                    Agent is still working. Plans will appear when ready.
                  </p>
                </div>
              ) : status === "completed" ? (
                <p className="text-sm text-muted-foreground">
                  No {title.toLowerCase()} plans were generated for this project.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Launch a project to generate {title.toLowerCase()} plans.
                </p>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {allMatched.map(([filename, content]) => (
        <motion.div
          key={filename}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glow-card rounded-xl overflow-hidden"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--glow-cyan)/0.08)] border border-[hsl(var(--glow-cyan)/0.12)]">
                <Icon className="size-3 text-[hsl(var(--glow-cyan))]" />
              </div>
              {filename
                .replace(".md", "")
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                {content}
              </pre>
            </div>
          </CardContent>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feed item                                                          */
/* ------------------------------------------------------------------ */

function FeedItem({ event, index }: { event: AgentEvent; index: number }) {
  const config: Record<
    string,
    { icon: React.ReactNode; label: string; accent: string; bg: string }
  > = {
    assistant_text: {
      icon: <Terminal className="size-3" />,
      label: "Agent",
      accent: "text-[hsl(var(--glow-cyan))]",
      bg: "bg-[hsl(var(--glow-cyan)/0.06)] border-[hsl(var(--glow-cyan)/0.1)]",
    },
    tool_use: {
      icon: <Wrench className="size-3" />,
      label: "Tool",
      accent: "text-[hsl(var(--glow-violet))]",
      bg: "bg-[hsl(var(--glow-violet)/0.06)] border-[hsl(var(--glow-violet)/0.1)]",
    },
    tool_result: {
      icon: <ChevronRight className="size-3" />,
      label: "Result",
      accent: "text-muted-foreground",
      bg: "bg-muted/20 border-border/30",
    },
    result: {
      icon: <CheckCircle2 className="size-3" />,
      label: "Done",
      accent: "text-emerald-400",
      bg: "bg-emerald-500/5 border-emerald-500/10",
    },
    error: {
      icon: <AlertCircle className="size-3" />,
      label: "Error",
      accent: "text-red-400",
      bg: "bg-red-500/5 border-red-500/10",
    },
  };

  const c = config[event.type] ?? config.tool_result;

  const truncated =
    event.type === "assistant_text" &&
    event.content &&
    event.content.length > 200
      ? event.content.slice(0, 200) + "..."
      : event.content;

  return (
    <motion.div
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className={`rounded-lg border ${c.bg} p-3 transition-colors hover:border-opacity-60`}
    >
      <div className="flex items-center gap-2">
        <span className={`${c.accent} shrink-0`}>{c.icon}</span>
        <span className={`text-[11px] font-mono font-medium ${c.accent} uppercase tracking-wide`}>
          {c.label}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/30 ml-auto">
          #{String(index + 1).padStart(3, "0")}
        </span>
      </div>
      {truncated && (
        <p className="mt-1.5 text-xs text-muted-foreground/70 whitespace-pre-wrap break-words font-mono leading-relaxed">
          {truncated}
        </p>
      )}
    </motion.div>
  );
}
