"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, MessageSquare, Globe, FileText, Mail } from "lucide-react";
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

export default function DashboardPage() {
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
              <span className="h-2 w-2 rounded-full bg-amber-500/80 animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">
                Idle
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
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border bg-muted/50 p-3"
                    >
                      <span className="text-xs font-mono text-primary">
                        Turn {i}
                      </span>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        Placeholder for agent decisions. Connect realtime.
                      </p>
                    </div>
                  ))}
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
