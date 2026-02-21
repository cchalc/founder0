import { query } from "@anthropic-ai/claude-agent-sdk";
import { buildSystemPrompt } from "./prompt.js";

export interface AgentEvent {
  type: "assistant_text" | "tool_use" | "tool_result" | "result" | "error";
  content: string;
  timestamp: string;
}

export type AgentEventCallback = (event: AgentEvent) => void;

function emit(cb: AgentEventCallback | undefined, type: AgentEvent["type"], content: string) {
  if (cb) cb({ type, content, timestamp: new Date().toISOString() });
}

export async function runFounderAgent(
  vision: string,
  outputDir: string,
  onEvent?: AgentEventCallback,
) {
  try {
    for await (const message of query({
      prompt: vision,
      options: {
        systemPrompt: buildSystemPrompt(),
        allowedTools: ["Write", "Edit", "Read", "Bash", "Glob", "Grep"],
        permissionMode: "acceptEdits",
        cwd: outputDir,
      },
    })) {
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          if ("text" in block) {
            emit(onEvent, "assistant_text", block.text);
            if (!onEvent) process.stdout.write(block.text);
          } else if ("type" in block && block.type === "tool_use") {
            const name = (block as { name?: string }).name ?? "unknown";
            emit(onEvent, "tool_use", name);
          }
        }
      } else if (message.type === "result") {
        const cost = message.total_cost_usd?.toFixed(4) ?? "?";
        const msg = `Done (${message.subtype}) | Cost: $${cost}`;
        emit(onEvent, "result", msg);
        if (!onEvent) console.log(`\n\n--- ${msg} ---`);
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    emit(onEvent, "error", errorMsg);
    if (!onEvent) throw err;
  }
}
