#!/usr/bin/env tsx
/**
 * Change X profile picture — logs in via cookies, navigates to profile
 * settings, and uploads a new avatar image.
 *
 * Usage:
 *   npx tsx src/browser/actions/change-x-pfp.ts ./avatar.png
 *
 * Requires: cookies-x.json in project root (run save-x-cookies.ts first)
 */
import { createSession, closeSession } from "../session-manager.js";
import { getStoredContextId } from "../context-manager.js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

const PROJECT_ROOT = resolve(import.meta.dirname, "../../..");
const COOKIES_PATH = resolve(PROJECT_ROOT, "cookies-x.json");

function humanDelay(min: number, max: number) {
  return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

export interface ChangePfpOptions {
  imagePath: string;
  sessionId?: string;
}

export interface ChangePfpResult {
  success: boolean;
  sessionId: string;
  message: string;
  screenshot?: string;
}

async function loginWithCookies(page: any): Promise<boolean> {
  if (!existsSync(COOKIES_PATH)) return false;

  try {
    const cookies = JSON.parse(readFileSync(COOKIES_PATH, "utf-8"));
    if (!Array.isArray(cookies) || cookies.length === 0) return false;

    console.log(`[change-pfp] Injecting ${cookies.length} cookies...`);
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
    return true;
  } catch {
    return false;
  }
}

export async function changeXPfp(options: ChangePfpOptions): Promise<ChangePfpResult> {
  const { imagePath, sessionId } = options;

  const absPath = resolve(process.cwd(), imagePath);
  if (!existsSync(absPath)) {
    return {
      success: false,
      sessionId: "",
      message: `Image not found: ${absPath}`,
    };
  }

  const contextId = getStoredContextId();
  const session = await createSession({
    contextId: contextId ?? undefined,
    persist: true,
  });
  const { stagehand } = session;
  const page = stagehand.context.pages()[0] as any;

  try {
    // Log in
    await loginWithCookies(page);
    await page.goto("https://x.com/home", {
      waitUntil: "domcontentloaded",
      timeoutMs: 30_000,
    });
    await humanDelay(3000, 4000);

    const isLoggedIn = await page.evaluate(() => {
      const compose = document.querySelector('[data-testid="tweetTextarea_0"]');
      const timeline = document.querySelector('[data-testid="primaryColumn"]');
      const sideNav = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
      return Boolean(compose || timeline || sideNav);
    });

    if (!isLoggedIn) {
      throw new Error(
        "Not logged in. Run 'npx tsx src/browser/actions/save-x-cookies.ts' first."
      );
    }
    console.log("[change-pfp] Logged in!");

    // Navigate to profile settings
    console.log("[change-pfp] Navigating to profile settings...");
    await page.goto("https://x.com/settings/profile", {
      waitUntil: "domcontentloaded",
      timeoutMs: 30_000,
    });
    await humanDelay(3000, 4000);

    // Click the avatar / "Edit profile picture" area
    console.log("[change-pfp] Looking for avatar upload...");
    await stagehand.act("click on the profile picture or the camera icon on the avatar to change it");
    await humanDelay(2000, 3000);

    // Set the file on the hidden file input
    console.log(`[change-pfp] Uploading ${absPath}...`);
    const fileInput = await page.$('input[type="file"][accept*="image"]');
    if (fileInput) {
      await fileInput.setInputFiles(absPath);
    } else {
      // Fallback: try to find any file input on the page
      const anyInput = await page.$('input[type="file"]');
      if (anyInput) {
        await anyInput.setInputFiles(absPath);
      } else {
        throw new Error("Could not find file input for image upload");
      }
    }
    await humanDelay(3000, 4000);

    // Apply/save — X shows a crop dialog after uploading
    console.log("[change-pfp] Applying image...");
    await stagehand.act("click the 'Apply' button to confirm the profile picture");
    await humanDelay(2000, 3000);

    // Save profile changes
    console.log("[change-pfp] Saving profile...");
    await stagehand.act("click the 'Save' button to save profile changes");
    await humanDelay(3000, 4000);

    const screenshotBuffer = await page.screenshot({ type: "jpeg", quality: 75 });
    const screenshot = screenshotBuffer.toString("base64");

    console.log("[change-pfp] Done!");
    return {
      success: true,
      sessionId: session.sessionId,
      message: "Profile picture updated successfully",
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
      message: `Failed: ${err instanceof Error ? err.message : String(err)}`,
      screenshot,
    };
  }
}

// CLI entrypoint
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx src/browser/actions/change-x-pfp.ts <image-path>");
    console.error("  e.g. npx tsx src/browser/actions/change-x-pfp.ts ./avatar.png");
    process.exit(1);
  }

  const result = await changeXPfp({ imagePath: args[0] });
  console.log(`\nSuccess: ${result.success}`);
  console.log(`Message: ${result.message}`);

  await closeSession(result.sessionId);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
