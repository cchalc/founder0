/**
 * Save X cookies — launches a Browserbase session, navigates to X login page,
 * and polls until it detects you've logged in. Then saves cookies.
 *
 * You log in by opening the debug URL in your browser and interacting with
 * the live Chrome session directly.
 *
 * Run: npx tsx src/browser/actions/save-x-cookies.ts
 */
import { createSession, closeSession } from "../session-manager.js";
import { writeFileSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

const COOKIES_PATH = resolve(process.cwd(), "cookies-x.json");
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_WAIT = 300000; // 5 minutes

async function main() {
  console.log("=== Save X Cookies ===\n");

  const session = await createSession();
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
        console.log(`Detected login! URL: ${url}`);
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
  await new Promise((r) => setTimeout(r, 3000));

  // Get all cookies via CDP
  const { cookies } = await page.sendCDP("Network.getCookies", {
    urls: ["https://x.com", "https://twitter.com"],
  });

  console.log(`\nGot ${cookies.length} cookies`);

  // Save cookies to file
  writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log(`Saved to ${COOKIES_PATH}`);

  await closeSession(session.sessionId);
  console.log("\n=== Done! You can now run test-post-x.ts ===");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
