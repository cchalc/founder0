"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Founder Agent
          </motion.span>
          <nav className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Button size="default">Sign In</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl"
        >
          Deploy an AI that launches your product
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 text-lg leading-relaxed text-muted-foreground"
        >
          One prompt. The agent researches, builds, deploys, monetizes, and
          markets — all on its own. A live URL, real payments, real posts.
        </motion.p>

        {/* Prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12"
        >
          <label
            htmlFor="idea"
            className="mb-3 block text-sm font-medium text-muted-foreground"
          >
            What&apos;s your company idea?
          </label>
          <Textarea
            id="idea"
            placeholder="e.g. A subscription box for busy parents who want healthy meal prep..."
            rows={4}
            className="min-h-[120px] resize-none"
            value={vision}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVision(e.target.value)}
            disabled={launching}
          />

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <div className="mt-6 flex gap-4">
            <Button
              size="lg"
              className="gap-2"
              onClick={handleLaunch}
              disabled={!vision.trim() || launching}
            >
              {launching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Launching…
                </>
              ) : (
                <>
                  Launch Run
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="size-4" />
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
