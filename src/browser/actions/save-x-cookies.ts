/**
 * Save X login — launches a Browserbase session with a persistent context,
 * navigates to X login page, and polls until it detects you've logged in.
 * The session uses Browserbase Contexts so cookies are saved automatically
 * when the session closes.
 *
 * You log in by opening the debug URL in your browser and interacting with
 * the live Chrome session directly.
 *
 * Run: npx tsx src/browser/actions/save-x-cookies.ts
 */
import { createSession, closeSession } from "../session-manager.js";
import { getOrCreateContext } from "../context-manager.js";
import { writeFileSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

const PROJECT_ROOT = resolve(import.meta.dirname, "../../..");
const COOKIES_PATH = resolve(PROJECT_ROOT, "cookies-x.json");
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_WAIT = 300000; // 5 minutes

async function main() {
  console.log("=== Save X Login (Browserbase Context) ===\n");

  // Get or create a Browserbase context to persist cookies
  const contextId = await getOrCreateContext();

  const session = await createSession({ contextId, persist: true });
  const { stagehand } = session;
  const page = stagehand.context.pages()[0] as any;

  // Navigate to X login page
  await page.goto("https://x.com/i/flow/login", {
    waitUntil: "domcontentloaded",
    timeoutMs: 30_000,
  });

  console.log("\n==========================================================");
  console.log("  Open this URL in your browser to control the session:");
  console.log(`  https://www.browserbase.com/sessions/${session.sessionId}`);
  console.log("==========================================================");
  console.log("\nLog in to X manually. I'll detect it automatically...\n");

  // Poll until we detect a logged-in state
  const start = Date.now();
  let loggedIn = false;

  while (Date.now() - start < MAX_WAIT) {
    try {
      const url: string = page.url();
      const hasLoggedInIndicator = await page.evaluate(() => {
        const compose = document.querySelector('[data-testid="tweetTextarea_0"]');
        const timeline = document.querySelector('[data-testid="primaryColumn"]');
        const sideNav = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
        const homeLink = document.querySelector('[data-testid="AppTabBar_Home_Link"]');
        return !!(compose || timeline || sideNav || homeLink);
      });

      if (hasLoggedInIndicator || (url.includes("x.com/home") && !url.includes("flow"))) {
        loggedIn = true;
        console.log(`\nDetected login! URL: ${url}`);
        break;
      }

      const elapsed = Math.round((Date.now() - start) / 1000);
      process.stdout.write(`\r  Waiting... (${elapsed}s) URL: ${url.slice(0, 60)}`);
    } catch {
      // Page might be navigating
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  if (!loggedIn) {
    console.log("\n\nTimed out waiting for login.");
    await closeSession(session.sessionId);
    process.exit(1);
  }

  // Wait a bit for cookies to settle
  console.log("Waiting for cookies to settle...");
  await new Promise((r) => setTimeout(r, 3000));

  // Save cookies to local file as well (fallback for when context cookies don't work)
  try {
    const { cookies } = await page.sendCDP("Network.getCookies", {
      urls: ["https://x.com", "https://twitter.com"],
    });
    writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    console.log(`Saved ${cookies.length} cookies to ${COOKIES_PATH}`);
  } catch (err) {
    console.log("Could not save cookies to file:", err);
  }

  // Close the session — persist: true means Browserbase also saves cookies to the context
  await closeSession(session.sessionId);

  // Give Browserbase a few seconds to sync the context data
  console.log("Waiting for context to sync...");
  await new Promise((r) => setTimeout(r, 5000));

  console.log(`\n=== Done! Cookies saved to: ===`);
  console.log(`  1. Browserbase Context: ${contextId}`);
  console.log(`  2. Local file: ${COOKIES_PATH}`);
  console.log("=== You can now run test-post-x.ts ===");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
