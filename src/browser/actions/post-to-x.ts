import { createSession, getSession, closeSession } from "../session-manager.js";
import { getOrCreateContext, getStoredContextId } from "../context-manager.js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

// Always resolve relative to project root, not CWD
const PROJECT_ROOT = resolve(import.meta.dirname, "../../..");
const COOKIES_PATH = resolve(PROJECT_ROOT, "cookies-x.json");

export interface PostToXOptions {
  username: string;
  password: string;
  text: string;
  sessionId?: string;
}

export interface PostToXResult {
  success: boolean;
  sessionId: string;
  message: string;
  url?: string;
  screenshot?: string; // base64
}

function humanDelay(min: number, max: number) {
  return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

export async function postToX(options: PostToXOptions): Promise<PostToXResult> {
  const { username, password, text, sessionId } = options;

  // Use Browserbase Context to reuse cookies/auth from previous sessions
  const contextId = getStoredContextId();

  const session = sessionId
    ? getSession(sessionId) ?? await createSession({ contextId: contextId ?? undefined, persist: true })
    : await createSession({ contextId: contextId ?? undefined, persist: true });

  const { stagehand } = session;
  const page = stagehand.context.pages()[0] as any;

  try {
    // Try cookies-x.json first, then context, then login flow
    let loggedIn = false;

    // Method 1: Inject cookies from cookies-x.json
    if (existsSync(COOKIES_PATH)) {
      try {
        const cookies = JSON.parse(readFileSync(COOKIES_PATH, "utf-8"));
        if (Array.isArray(cookies) && cookies.length > 0) {
          console.log(`[post-to-x] Injecting ${cookies.length} cookies from cookies-x.json...`);
          for (const cookie of cookies) {
            try {
              await page.sendCDP("Network.setCookie", {
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path || "/",
                secure: cookie.secure ?? true,
                httpOnly: cookie.httpOnly ?? false,
                sameSite: cookie.sameSite || "Lax",
                expires: cookie.expires || (Date.now() / 1000 + 86400 * 30),
              });
            } catch { /* some cookies may fail */ }
          }

          await page.goto("https://x.com/home", {
            waitUntil: "domcontentloaded",
            timeoutMs: 30_000,
          });
          await humanDelay(3000, 4000);

          loggedIn = await page.evaluate(() => {
            const compose = document.querySelector('[data-testid="tweetTextarea_0"]');
            const timeline = document.querySelector('[data-testid="primaryColumn"]');
            const sideNav = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
            return Boolean(compose || timeline || sideNav);
          });

          if (loggedIn) {
            console.log("[post-to-x] Logged in via cookies-x.json!");
          } else {
            console.log("[post-to-x] cookies-x.json didn't work, trying next method...");
          }
        }
      } catch (err) {
        console.log(`[post-to-x] cookies-x.json failed: ${err}`);
      }
    }

    // Method 2: Browserbase context cookies
    if (!loggedIn && contextId) {
      console.log("[post-to-x] Navigating to X home with context cookies...");
      await page.goto("https://x.com/home", {
        waitUntil: "domcontentloaded",
        timeoutMs: 30_000,
      });
      await humanDelay(3000, 4000);

      loggedIn = await page.evaluate(() => {
        const compose = document.querySelector('[data-testid="tweetTextarea_0"]');
        const timeline = document.querySelector('[data-testid="primaryColumn"]');
        const sideNav = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
        return Boolean(compose || timeline || sideNav);
      });

      if (loggedIn) {
        console.log("[post-to-x] Logged in via context cookies!");
      } else {
        console.log("[post-to-x] Context cookies didn't work either...");
      }
    }

    // Method 3: Login flow fallback
    if (!loggedIn) {
      // No context — try the login flow (may fail due to bot detection)
      console.log("[post-to-x] No context found, attempting login flow...");
      await page.goto("https://x.com/i/flow/login", {
        waitUntil: "domcontentloaded",
        timeoutMs: 30_000,
      });
      await humanDelay(4000, 5000);

      // Username
      console.log("[post-to-x] Entering username...");
      await stagehand.act("type %username% into the username, phone, or email input field", {
        variables: { username },
      });
      await humanDelay(600, 1000);

      // Next
      console.log("[post-to-x] Clicking Next...");
      await stagehand.act("click the 'Next' button");

      // Wait for password screen
      console.log("[post-to-x] Waiting for password screen...");
      await humanDelay(8000, 10000);

      // Password
      console.log("[post-to-x] Entering password...");
      let passwordTyped = false;
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          await stagehand.act("type %password% into the password input field", {
            variables: { password },
          });
          passwordTyped = true;
          console.log(`[post-to-x] Password entered on attempt ${attempt}`);
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.log(`[post-to-x] Password attempt ${attempt} failed: ${msg.slice(0, 100)}`);
          if (attempt < 4) await humanDelay(3000, 4000);
        }
      }

      if (!passwordTyped) {
        throw new Error(
          "Could not type password — iframe not accessible. Try: npx tsx src/browser/actions/save-x-cookies.ts"
        );
      }
      await humanDelay(600, 1000);

      // Submit
      console.log("[post-to-x] Clicking Log in...");
      await stagehand.act("click the 'Log in' button, NOT 'Sign up'");
      await humanDelay(6000, 8000);

      // Verify login
      const url: string = page.url();
      const after: string = await page.evaluate(() => document.body.innerText);
      const afterLower = after.toLowerCase();

      if (
        url.includes("/flow/") ||
        afterLower.includes("sign in to x") ||
        afterLower.includes("could not log you in") ||
        afterLower.includes("join today")
      ) {
        throw new Error(
          `Login failed (bot detection?). Try: npx tsx src/browser/actions/save-x-cookies.ts`
        );
      }

      console.log("[post-to-x] Logged in via login flow!");
    }

    // Compose and post tweet
    console.log("[post-to-x] Composing tweet...");

    const composeFocused = await page.evaluate(() => {
      const textarea = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
      if (textarea) { textarea.focus(); textarea.click(); return true; }
      const ce = document.querySelector('[contenteditable="true"][role="textbox"]') as HTMLElement;
      if (ce) { ce.focus(); ce.click(); return true; }
      return false;
    });
    if (!composeFocused) {
      await stagehand.act("click on the tweet compose text box that says 'What is happening?!'");
    }
    await humanDelay(800, 1200);

    await stagehand.act("type %text% into the tweet compose area", {
      variables: { text },
    });
    await humanDelay(1000, 1500);

    console.log("[post-to-x] Posting...");
    const postClicked = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="tweetButtonInline"]') as HTMLElement;
      if (btn) { btn.click(); return true; }
      const btn2 = document.querySelector('[data-testid="tweetButton"]') as HTMLElement;
      if (btn2) { btn2.click(); return true; }
      return false;
    });
    if (!postClicked) {
      await stagehand.act("click the 'Post' button to publish the tweet");
    }
    await humanDelay(3000, 4000);

    // TODO: X sometimes shows a popup/modal after posting (e.g. "Got it" or promotional dialogs).
    // Dismiss it so the page is in a clean state. Thread posting is disabled until this is reliable.
    try {
      const dismissed = await page.evaluate(() => {
        // Look for common dismiss buttons in popups/modals
        const selectors = [
          '[data-testid="sheetDialog"] [role="button"]',
          '[data-testid="app-bar-close"]',
          '[aria-label="Close"]',
          '[aria-label="Got it"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel) as HTMLElement;
          if (el) { el.click(); return true; }
        }
        return false;
      });
      if (dismissed) {
        console.log("[post-to-x] Dismissed post-tweet popup");
        await humanDelay(1000, 1500);
      }
    } catch { /* no popup to dismiss */ }

    const screenshotBuffer = await page.screenshot({ type: "jpeg", quality: 75 });
    const screenshot = screenshotBuffer.toString("base64");
    console.log("[post-to-x] Done.");

    return {
      success: true,
      sessionId: session.sessionId,
      message: `Successfully posted: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
      url: page.url(),
      screenshot,
    };
  } catch (err) {
    let screenshot: string | undefined;
    try {
      const buf = await page.screenshot({ type: "jpeg", quality: 75 });
      screenshot = buf.toString("base64");
    } catch { /* ignore */ }

    return {
      success: false,
      sessionId: session.sessionId,
      message: `Post failed: ${err instanceof Error ? err.message : String(err)}`,
      url: page.url(),
      screenshot,
    };
  }
}
