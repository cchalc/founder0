"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Loader2, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function Home() {
  const router = useRouter();
  const [vision, setVision] = useState("");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLaunch() {
    if (!vision.trim() || launching) return;
    setLaunching(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vision: vision.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }

      await res.json();
      router.push("/dashboard?new=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start run");
      setLaunching(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background noise-overlay">
      {/* Animated mesh background */}
      <div className="mesh-bg" />

      {/* Dot grid overlay */}
      <div className="fixed inset-0 dot-grid pointer-events-none z-[1]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Nav */}
        <header className="border-b border-border/50 backdrop-blur-md bg-background/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Founder Agent
            </motion.span>
            <motion.nav
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center gap-8"
            >
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Button
                size="default"
                className="border border-border/60 bg-secondary/80 text-foreground hover:bg-secondary hover:border-[hsl(var(--glow-cyan)/0.3)] transition-all"
                variant="outline"
              >
                Sign In
              </Button>
            </motion.nav>
          </div>
        </header>

        {/* Hero */}
        <main className="mx-auto max-w-3xl px-6 pt-28 pb-32">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="size-3 text-[hsl(var(--glow-cyan))]" />
              Autonomous AI Founder
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl"
          >
            Deploy an AI that{" "}
            <span className="glow-text">launches your product</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            One prompt. The agent researches, builds, deploys, monetizes, and
            markets — all on its own. A live URL, real payments, real posts.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {["Build", "Deploy", "Monetize", "Market"].map((item, i) => (
              <span
                key={item}
                className="rounded-md border border-border/40 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </motion.div>

          {/* Prompt input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-14"
          >
            <label
              htmlFor="idea"
              className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground/80"
            >
              <Rocket className="size-3.5 text-[hsl(var(--glow-cyan))]" />
              What&apos;s your company idea?
            </label>
            <div className="gradient-border">
              <textarea
                id="idea"
                placeholder="e.g. A subscription box for busy parents who want healthy meal prep..."
                rows={4}
                className="textarea-glow w-full resize-none rounded-[var(--radius)] border border-border/60 bg-card/80 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all backdrop-blur-sm focus:border-[hsl(var(--glow-cyan)/0.4)] min-h-[130px] font-[family-name:var(--font-sans)]"
                value={vision}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setVision(e.target.value)
                }
                disabled={launching}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}

            <div className="mt-8 flex gap-4">
              <button
                className="btn-launch inline-flex h-11 items-center gap-2.5 rounded-[var(--radius)] px-7 text-sm font-semibold disabled:pointer-events-none cursor-pointer"
                onClick={handleLaunch}
                disabled={!vision.trim() || launching}
              >
                {launching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    Launch Run
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-border transition-all"
              >
                <Play className="size-4" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
