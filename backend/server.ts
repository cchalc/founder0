import "dotenv/config";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
import express from "express";
import cors from "cors";
import { config } from "./agent-core/config.js";
import { runFounderAgent, type AgentEvent } from "./agent-core/pipeline.js";

const app = express();
app.use(cors());
app.use(express.json());

interface Run {
  id: string;
  vision: string;
  status: "running" | "completed" | "error";
  events: AgentEvent[];
  listeners: Set<(event: AgentEvent | { type: "done" }) => void>;
}

const runs = new Map<string, Run>();

// initial prompt by the user 
app.post("/api/launch", (req, res) => {
  const { vision } = req.body;

  if (!vision || typeof vision !== "string" || !vision.trim()) {
    res.status(400).json({ error: "vision is required" });
    return;
  }

  const id = String(Date.now());
  const outputDir = resolve(config.OUTPUT_DIR);
  mkdirSync(outputDir, { recursive: true });

  const run: Run = {
    id,
    vision: vision.trim(),
    status: "running",
    events: [],
    listeners: new Set(),
  };
  runs.set(id, run);

  runFounderAgent(run.vision, outputDir, (event) => {
    run.events.push(event);
    for (const listener of run.listeners) listener(event);

    if (event.type === "result" || event.type === "error") {
      run.status = event.type === "error" ? "error" : "completed";
      for (const listener of run.listeners) listener({ type: "done" });
    }
  }).then(() => {
    if (run.status === "running") {
      run.status = "completed";
      for (const listener of run.listeners) listener({ type: "done" });
    }
  }).catch((err) => {
    const errorEvent: AgentEvent = {
      type: "error",
      content: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    };
    run.events.push(errorEvent);
    run.status = "error";
    for (const listener of run.listeners) {
      listener(errorEvent);
      listener({ type: "done" });
    }
  });

  res.json({ runId: id });
});

// running stream
app.get("/api/runs/:runId/stream", (req, res) => {
  const run = runs.get(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  for (const event of run.events) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  if (run.status !== "running") {
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }

  const listener = (event: AgentEvent | { type: "done" }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (event.type === "done") {
      run.listeners.delete(listener);
      res.end();
    }
  };

  run.listeners.add(listener);

  req.on("close", () => {
    run.listeners.delete(listener);
  });
});


// runner
app.get("/api/runs/:runId", (req, res) => {
  const run = runs.get(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  res.json({ id: run.id, vision: run.vision, status: run.status, eventCount: run.events.length });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
