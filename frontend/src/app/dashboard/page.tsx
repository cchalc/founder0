"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface AgentEvent {
  type: "assistant_text" | "tool_use" | "tool_result" | "result" | "error" | "done";
  content?: string;
  timestamp?: string;
}

const SECTIONS = [
  {
    id: "app",
    label: "App",
    desc: "Deployed product, live URL, payment link",
    icon: Globe,
  },
  {
    id: "social",
    label: "Social Media",
    desc: "Launch posts, X threads, marketing copy",
    icon: MessageSquare,
  },
  {
    id: "yc",
    label: "YC Pitch",
    desc: "Application draft, one-pager, deck outline",
    icon: FileText,
  },
  {
    id: "outreach",
    label: "Outreach",
    desc: "Sponsorship emails, partner intros, cold outreach",
    icon: Mail,
  },
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
  const runId = searchParams.get("runId");

  const [status, setStatus] = useState<RunStatus>(runId ? "running" : "idle");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!runId) return;

    const eventSource = new EventSource(`${API_URL}/api/runs/${runId}/stream`);

    eventSource.onmessage = (e) => {
      const event: AgentEvent = JSON.parse(e.data);

      if (event.type === "done") {
        setStatus((prev: RunStatus) => (prev === "running" ? "completed" : prev));
        eventSource.close();
        return;
      }

      if (event.type === "error") {
        setStatus("error");
      }

      setEvents((prev: AgentEvent[]) => [...prev, event]);
    };

    eventSource.onerror = () => {
      eventSource.close();
      setStatus((prev: RunStatus) => (prev === "running" ? "error" : prev));
    };

    return () => eventSource.close();
  }, [runId]);

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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground hover:opacity-90"
          >
            Founder Agent
          </Link>
          <nav className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
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

      {/* Section tabs */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs defaultValue="app" className="space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted p-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow"
              >
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Active section content */}
            <div className="lg:col-span-2">
              {SECTIONS.map((section) => (
                <TabsContent key={section.id} value={section.id} className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionCard section={section} />
                  </motion.div>
                </TabsContent>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Bot className="size-4" />
                    Agent feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    ref={feedRef}
                    className="max-h-[400px] space-y-2 overflow-y-auto pr-1"
                  >
                    {events.length === 0 && status === "idle" && (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        No active run. Launch from the home page.
                      </p>
                    )}
                    {events.length === 0 && status === "running" && (
                      <p className="text-xs text-muted-foreground py-4 text-center animate-pulse">
                        Waiting for agent…
                      </p>
                    )}
                    {events.map((event, i) => (
                      <FeedItem key={i} event={event} index={i} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Steering</CardTitle>
                  <CardDescription>
                    Send a command to the agent between turns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g. Focus on the landing page copy..."
                    rows={3}
                    disabled
                    className="resize-none"
                  />
                  <Button disabled className="mt-3 w-full" variant="secondary">
                    Send
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

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
      <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap wrap-break-word">
        {truncated}
      </p>
    </motion.div>
  );
}

function SectionCard({
  section,
}: {
  section: (typeof SECTIONS)[number];
}) {
  const Icon = section.icon;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5" />
          {section.label}
        </CardTitle>
        <CardDescription>{section.desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">
            Placeholder for {section.label.toLowerCase()} artifacts. Connect
            Supabase to stream generated content.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
