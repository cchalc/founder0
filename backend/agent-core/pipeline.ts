import { query } from "@anthropic-ai/claude-agent-sdk";
import { buildSystemPrompt } from "./prompt.js";

export async function runFounderAgent(vision: string, outputDir: string) {
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
          process.stdout.write(block.text);
        }
      }
    } else if (message.type === "result") {
      console.log(`\n\n--- Done (${message.subtype}) | Cost: $${message.total_cost_usd?.toFixed(4)} ---`);
    }
  }
}
