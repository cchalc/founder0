import "dotenv/config";
import { resolve } from "node:path";
import {
  mkdirSync,
  rmSync,
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import express from "express";
import cors from "cors";
import { config } from "./agent-core/config.js";
import { runFounderAgent, type AgentEvent } from "./agent-core/pipeline.js";

const app = express();
app.use(cors());
app.use(express.json());

const CURRENT_DIR = resolve(config.OUTPUT_DIR, "current");
const META_FILE = resolve(CURRENT_DIR, ".meta.json");
const SUMMARY_FILE = resolve(CURRENT_DIR, "business-summary.json");
const PLANS_DIR = resolve(CURRENT_DIR, "plans");
const PREVIEW_PORT = 4000;

interface RunMeta {
  vision: string;
  status: "running" | "completed" | "error";
  startedAt: string;
  completedAt?: string;
}

interface CurrentRun {
  vision: string;
  status: "running" | "completed" | "error";
  events: AgentEvent[];
  listeners: Set<(event: AgentEvent | { type: "done" }) => void>;
}

let currentRun: CurrentRun | null = null;
let previewProcess: ChildProcess | null = null;
let previewReady = false;

function writeMeta(meta: RunMeta) {
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

function readMeta(): RunMeta | null {
  if (!existsSync(META_FILE)) return null;
  try {
    return JSON.parse(readFileSync(META_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function killPreview() {
  if (previewProcess) {
    previewProcess.kill("SIGTERM");
    previewProcess = null;
    previewReady = false;
  }
}

function startPreview() {
  killPreview();

  if (!existsSync(resolve(CURRENT_DIR, "package.json"))) return;

  console.log(`[preview] Installing deps and starting dev server on port ${PREVIEW_PORT}...`);

  const child = spawn("sh", ["-c", `npm install && npx next dev -p ${PREVIEW_PORT}`], {
    cwd: CURRENT_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(PREVIEW_PORT) },
  });

  previewProcess = child;

  child.stdout?.on("data", (data: Buffer) => {
    const text = data.toString();
    process.stdout.write(`[preview] ${text}`);
    if (text.includes("Ready") || text.includes("ready") || text.includes(`localhost:${PREVIEW_PORT}`)) {
      previewReady = true;
    }
  });

  child.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[preview:err] ${data.toString()}`);
  });

  child.on("exit", (code) => {
    console.log(`[preview] Process exited with code ${code}`);
    if (previewProcess === child) {
      previewProcess = null;
      previewReady = false;
    }
  });
}

// --- Launch a new run (replaces any existing project) ---
app.post("/api/launch", (req, res) => {
  const { vision } = req.body;

  if (!vision || typeof vision !== "string" || !vision.trim()) {
    res.status(400).json({ error: "vision is required" });
    return;
  }

  killPreview();

  if (existsSync(CURRENT_DIR)) {
    rmSync(CURRENT_DIR, { recursive: true, force: true });
  }
  mkdirSync(CURRENT_DIR, { recursive: true });

  const meta: RunMeta = {
    vision: vision.trim(),
    status: "running",
    startedAt: new Date().toISOString(),
  };
  writeMeta(meta);

  currentRun = {
    vision: vision.trim(),
    status: "running",
    events: [],
    listeners: new Set(),
  };

  const run = currentRun;

  runFounderAgent(run.vision, CURRENT_DIR, (event) => {
    run.events.push(event);
    for (const listener of run.listeners) listener(event);

    if (event.type === "result" || event.type === "error") {
      run.status = event.type === "error" ? "error" : "completed";
      meta.status = run.status;
      meta.completedAt = new Date().toISOString();
      writeMeta(meta);
      for (const listener of run.listeners) listener({ type: "done" });

      if (run.status === "completed") {
        startPreview();
      }
    }
  })
    .then(() => {
      if (run.status === "running") {
        run.status = "completed";
        meta.status = "completed";
        meta.completedAt = new Date().toISOString();
        writeMeta(meta);
        for (const listener of run.listeners) listener({ type: "done" });
        startPreview();
      }
    })
    .catch((err) => {
      const errorEvent: AgentEvent = {
        type: "error",
        content: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      };
      run.events.push(errorEvent);
      run.status = "error";
      meta.status = "error";
      meta.completedAt = new Date().toISOString();
      writeMeta(meta);
      for (const listener of run.listeners) {
        listener(errorEvent);
        listener({ type: "done" });
      }
    });

  res.json({ runId: "current" });
});

// --- SSE stream for current run ---
app.get("/api/runs/current/stream", (_req, res) => {
  if (!currentRun) {
    res.status(404).json({ error: "No active run" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  for (const event of currentRun.events) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  if (currentRun.status !== "running") {
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }

  const run = currentRun;
  const listener = (event: AgentEvent | { type: "done" }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (event.type === "done") {
      run.listeners.delete(listener);
      res.end();
    }
  };

  run.listeners.add(listener);

  _req.on("close", () => {
    run.listeners.delete(listener);
  });
});

// --- Current run status ---
app.get("/api/runs/current", (_req, res) => {
  const meta = readMeta();
  if (!meta) {
    res.json({ exists: false });
    return;
  }
  res.json({
    exists: true,
    vision: meta.vision,
    status: currentRun?.status ?? meta.status,
    startedAt: meta.startedAt,
    completedAt: meta.completedAt,
  });
});

// --- Business summary from the generated project ---
app.get("/api/runs/current/summary", (_req, res) => {
  if (!existsSync(SUMMARY_FILE)) {
    res.json({ exists: false });
    return;
  }

  try {
    const raw = readFileSync(SUMMARY_FILE, "utf-8");
    const summary = JSON.parse(raw);
    res.json({ exists: true, summary });
  } catch {
    res.json({ exists: false });
  }
});

// --- Plans from the generated project ---
app.get("/api/runs/current/plans", (_req, res) => {
  if (!existsSync(PLANS_DIR)) {
    res.json({ plans: {} });
    return;
  }

  const plans: Record<string, string> = {};
  try {
    const files = readdirSync(PLANS_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      plans[file] = readFileSync(resolve(PLANS_DIR, file), "utf-8");
    }
  } catch {
    // directory might not exist yet
  }

  res.json({ plans });
});

// --- Preview dev server status ---
app.get("/api/runs/current/preview-status", (_req, res) => {
  res.json({
    running: previewProcess !== null,
    ready: previewReady,
    port: PREVIEW_PORT,
    url: `http://localhost:${PREVIEW_PORT}`,
  });
});

// --- Manually trigger preview start ---
app.post("/api/runs/current/start-preview", (_req, res) => {
  if (!existsSync(resolve(CURRENT_DIR, "package.json"))) {
    res.status(400).json({ error: "No project to preview" });
    return;
  }
  startPreview();
  res.json({ ok: true, port: PREVIEW_PORT });
});

// Legacy compat: redirect old /api/runs/:runId to current
app.get("/api/runs/:runId/stream", (req, res) => {
  if (req.params.runId !== "current") {
    res.status(404).json({ error: "Only 'current' run is supported" });
    return;
  }
  // handled by the /current route above via Express routing order
  res.redirect("/api/runs/current/stream");
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);

  // If there's an existing completed project, auto-start preview
  const meta = readMeta();
  if (meta && meta.status === "completed" && existsSync(resolve(CURRENT_DIR, "package.json"))) {
    console.log("[startup] Found existing completed project, starting preview...");
    startPreview();
  }
});
