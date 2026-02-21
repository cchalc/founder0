import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { config } from "./config.js";
import { runFounderAgent } from "./pipeline.js";

const vision = process.argv.slice(2).join(" ");

if (!vision) {
  console.error("Usage: npx tsx agent-core/run.ts <vision>");
  console.error('Example: npx tsx agent-core/run.ts "Build a SaaS invoice tracker"');
  process.exit(1);
}

const outputDir = resolve(config.OUTPUT_DIR);
mkdirSync(outputDir, { recursive: true });

console.log(`Output directory: ${outputDir}`);
console.log(`Vision: ${vision}\n`);

await runFounderAgent(vision, outputDir);
