/**
 * Quick browser test — creates a Browserbase session, navigates to a page,
 * extracts the title, takes a screenshot, and closes.
 *
 * Run: npx tsx src/browser/test.ts
 */
import { z } from "zod";
import { createSession, closeSession } from "./session-manager.js";
import { browserAction } from "./browser-tool.js";
import { browseAndExtract } from "./actions/browse-and-extract.js";

async function main() {
  console.log("=== Browser Test ===\n");

  // Test 1: Basic navigation + action
  console.log("1. Testing browserAction — navigate to example.com...");
  const result = await browserAction("extract the main heading text from the page", {
    url: "https://example.com",
  });
  console.log(`   Success: ${result.success}`);
  console.log(`   Session: ${result.sessionId}`);
  console.log(`   URL: ${result.url}`);
  console.log(`   Screenshot: ${result.screenshot ? `${result.screenshot.length} chars base64` : "none"}`);
  console.log(`   Data:`, result.data);

  // Close session from test 1 before opening a new one (free plan = 1 concurrent)
  console.log(`\n   Closing session ${result.sessionId}...`);
  await closeSession(result.sessionId);

  // Test 2: Structured extraction
  console.log("\n2. Testing browseAndExtract — extract from Hacker News...");
  const stories = await browseAndExtract(
    "https://news.ycombinator.com",
    "Extract the top 3 story titles and their URLs",
    z.array(
      z.object({
        title: z.string(),
        url: z.string(),
      })
    ).describe("Top stories from Hacker News")
  );
  console.log("   Stories:", JSON.stringify(stories, null, 2));

  // Cleanup
  console.log("\n3. Closing sessions...");
  const { listSessions, closeAllSessions } = await import("./session-manager.js");
  console.log(`   Active sessions: ${listSessions().length}`);
  await closeAllSessions();
  console.log("   All sessions closed.");

  console.log("\n=== Browser Test Complete ===");
}

main().catch((err) => {
  console.error("Browser test failed:", err);
  process.exit(1);
});
