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

  const statusConfig: Record<RunStatus, { color: string; label: string }> = {
    idle: { color: "bg-amber-500/80", label: "Idle" },
    running: { color: "bg-emerald-500", label: "Running" },
    completed: { color: "bg-blue-500", label: "Completed" },
    error: { color: "bg-red-500", label: "Error" },
  };

  const { color, label } = statusConfig[status];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Nav */}
      <header className="shrink-0 border-b border-border">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground hover:opacity-90"
          >
            Founder Agent
          </Link>
          <nav className="flex items-center gap-6">
            {runInfo?.vision && (
              <span className="max-w-[300px] truncate text-xs text-muted-foreground">
                {runInfo.vision}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${color} ${
                  status === "running" ? "animate-pulse" : ""
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
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="app" className="flex h-full flex-col">
          <div className="shrink-0 border-b border-border px-6">
            <TabsList className="h-auto justify-start gap-1 rounded-none bg-transparent p-0">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Icon className="size-4" />
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
                matchKeys={["outreach", "developer-outreach", "seo-content", "seo-strategy", "seo_content"]}
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
      <div className="w-[380px] shrink-0 flex flex-col border-r border-border">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Bot className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Agent Feed</span>
          {status === "running" && (
            <Loader2 className="ml-auto size-3.5 animate-spin text-emerald-400" />
          )}
        </div>

        <div
          ref={feedRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
        >
          {events.length === 0 && status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Bot className="size-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No active run</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Launch a project from the home page to see agent activity here.
              </p>
            </div>
          )}
          {events.length === 0 && status === "running" && (
            <div className="flex items-center gap-2 justify-center py-8">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Waiting for agent…
              </span>
            </div>
          )}
          {events.map((event, i) => (
            <FeedItem key={i} event={event} index={i} />
          ))}
        </div>
      </div>

      {/* Right: iframe preview */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <Monitor className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {previewStatus?.ready && (
              <>
                <a
                  href={PREVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="size-3" />
                  Open
                </a>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="size-3" />
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          {!previewStatus?.ready ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {status === "running" ? (
                <>
                  <Loader2 className="size-8 animate-spin text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Agent is building your app…
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Preview will appear when the build completes.
                  </p>
                </>
              ) : status === "completed" ? (
                <>
                  <Loader2 className="size-8 animate-spin text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Starting preview server…
                  </p>
                </>
              ) : status === "error" ? (
                <>
                  <AlertCircle className="size-8 text-red-400/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Build failed. Check the agent feed for details.
                  </p>
                </>
              ) : (
                <>
                  <Monitor className="size-8 text-muted-foreground/20 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No app to preview yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
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
    const name = filename.replace(".md", "").toLowerCase().replace(/-/g, " ");
    return name.includes(title.toLowerCase()) && !matched.some(([f]) => f === filename);
  });

  const allMatched = [...matched, ...titleMatch];

  if (allMatched.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-5" />
              {title}
            </CardTitle>
            <CardDescription>{fallbackDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border bg-muted/30 p-8 text-center">
              {status === "running" ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
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
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {allMatched.map(([filename, content]) => (
        <Card key={filename}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="size-4" />
              {filename.replace(".md", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                {content}
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feed item                                                          */
/* ------------------------------------------------------------------ */

function FeedItem({ event, index }: { event: AgentEvent; index: number }) {
  const iconMap: Record<string, React.ReactNode> = {
    assistant_text: <Terminal className="size-3 shrink-0 text-emerald-400" />,
    tool_use: <Wrench className="size-3 shrink-0 text-blue-400" />,
    result: <CheckCircle2 className="size-3 shrink-0 text-blue-400" />,
    error: <AlertCircle className="size-3 shrink-0 text-red-400" />,
  };

  const labelMap: Record<string, string> = {
    assistant_text: "Agent",
    tool_use: "Tool",
    result: "Result",
    error: "Error",
  };

  const truncated =
    event.type === "assistant_text" && event.content && event.content.length > 200
      ? event.content.slice(0, 200) + "…"
      : event.content;

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-md border border-border bg-muted/50 p-3"
    >
      <div className="flex items-center gap-1.5">
        {iconMap[event.type]}
        <span className="text-xs font-mono text-primary">
          {labelMap[event.type] ?? event.type} #{index + 1}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-words">
        {truncated}
      </p>
    </motion.div>
  );
}
