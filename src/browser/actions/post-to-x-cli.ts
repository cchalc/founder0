#!/usr/bin/env tsx
/**
 * CLI wrapper for posting to X. Used by the Founder Agent via Bash.
 *
 * Usage:
 *   npx tsx src/browser/actions/post-to-x-cli.ts "Your tweet text here"
 *   npx tsx src/browser/actions/post-to-x-cli.ts --thread '["Tweet 1", "Tweet 2", "Tweet 3"]'
 *
 * Requires: Browserbase context with saved cookies (run save-x-cookies.ts first)
 */
import { resolve } from "path";
import { config } from "dotenv";

// Load .env from project root (not CWD, since agent runs from output dir)
const PROJECT_ROOT = resolve(import.meta.dirname, "../../..");
config({ path: resolve(PROJECT_ROOT, ".env") });

import { postToX } from "./post-to-x.js";
import { closeAllSessions } from "../session-manager.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: npx tsx src/browser/actions/post-to-x-cli.ts \"tweet text\"");
    console.error("       npx tsx src/browser/actions/post-to-x-cli.ts --thread '[\"t1\", \"t2\"]'");
    process.exit(1);
  }

  // Parse args
  let tweets: string[];
  if (args[0] === "--thread" && args[1]) {
    try {
      tweets = JSON.parse(args[1]);
      if (!Array.isArray(tweets)) throw new Error("not an array");
    } catch {
      console.error("--thread expects a JSON array of strings");
      process.exit(1);
    }
  } else {
    tweets = [args.join(" ")];
  }

  const username = process.env.X_BURNER_USERNAME || "";
  const password = process.env.X_BURNER_PASSWORD || "";

  for (let i = 0; i < tweets.length; i++) {
    const text = tweets[i];
    console.log(`\n--- Posting tweet ${i + 1}/${tweets.length} ---`);
    console.log(`Text: "${text.slice(0, 80)}${text.length > 80 ? "..." : ""}"`);

    const result = await postToX({ username, password, text });

    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    if (result.url) console.log(`URL: ${result.url}`);

    if (!result.success) {
      console.error("Post failed — aborting remaining tweets");
      await closeAllSessions();
      process.exit(1);
    }

    // Small delay between thread tweets
    if (i < tweets.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  await closeAllSessions();
  console.log("\nAll tweets posted successfully!");
}

main().catch((err) => {
  console.error("CLI error:", err);
  closeAllSessions().finally(() => process.exit(1));
});
