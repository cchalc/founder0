/**
 * Inject auth_token into a Browserbase context so future sessions are logged in.
 * Usage: npx tsx src/browser/actions/inject-auth-token.ts <auth_token>
 */
import { resolve } from "path";
import { config } from "dotenv";

const PROJECT_ROOT = resolve(import.meta.dirname, "../../..");
config({ path: resolve(PROJECT_ROOT, ".env") });

import { getOrCreateContext } from "../context-manager.js";
import { createSession, closeSession } from "../session-manager.js";

async function main() {
  const authToken = process.argv[2];
  if (!authToken) {
    console.error("Usage: npx tsx src/browser/actions/inject-auth-token.ts <auth_token>");
    process.exit(1);
  }

  console.log("Creating/getting Browserbase context...");
  const contextId = await getOrCreateContext();
  console.log(`Context: ${contextId}`);

  console.log("Creating session with context...");
  const session = await createSession({ contextId, persist: true });
  const page = session.stagehand.context.pages()[0] as any;

  // Inject the auth_token cookie
  console.log("Injecting auth_token cookie...");
  await page.sendCDP("Network.setCookie", {
    name: "auth_token",
    value: authToken,
    domain: ".x.com",
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "None",
    expires: Math.floor(Date.now() / 1000) + 86400 * 365,
  });

  // Navigate to verify + capture all X cookies into the context
  console.log("Navigating to x.com/home to verify...");
  await page.goto("https://x.com/home", {
    waitUntil: "domcontentloaded",
    timeoutMs: 30_000,
  });
  await new Promise((r) => setTimeout(r, 5000));

  const loggedIn = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="tweetTextarea_0"]');
    const t = document.querySelector('[data-testid="primaryColumn"]');
    return Boolean(c || t);
  });

  console.log(`Logged in: ${loggedIn}`);
  console.log(`URL: ${page.url()}`);

  // Close session — this persists cookies to the context
  await closeSession(session.sessionId);

  if (loggedIn) {
    console.log(`\nContext ${contextId} now has X login cookies.`);
    console.log("Future runs will be logged in automatically!");
  } else {
    console.log("\nAuth token didn't work. Get a fresh one from Safari Developer Tools.");
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
