import { z, type ZodTypeAny } from "zod";
import { createSession, getSession, type SessionInfo } from "./session-manager.js";

export interface BrowserActionResult {
  success: boolean;
  sessionId: string;
  message: string;
  data?: unknown;
  screenshot?: string; // base64
  url?: string;
}

export interface BrowserActionOptions {
  url?: string;
  sessionId?: string;
  extractSchema?: ZodTypeAny;
}

/**
 * Main browser tool for the agent. Accepts a natural-language instruction,
 * creates or reuses a Stagehand session, executes the action, takes a
 * screenshot, and returns the result.
 */
export async function browserAction(
  instruction: string,
  options: BrowserActionOptions = {}
): Promise<BrowserActionResult> {
  const { url, sessionId, extractSchema } = options;

  // Get or create session
  let session: SessionInfo;
  if (sessionId) {
    const existing = getSession(sessionId);
    if (!existing) throw new Error(`Session ${sessionId} not found`);
    session = existing;
  } else {
    session = await createSession();
  }

  const { stagehand } = session;
  const page = stagehand.context.pages()[0];

  try {
    // Navigate if URL provided
    if (url) {
      await page.goto(url, { waitUntil: "domcontentloaded", timeoutMs: 30_000 });
    }

    let data: unknown = undefined;

    if (extractSchema) {
      // Extract structured data
      data = await stagehand.extract(instruction, extractSchema);
    } else {
      // Execute the action
      const result = await stagehand.act(instruction);
      data = { actionResult: result.message, actions: result.actions };
    }

    // Take screenshot
    const screenshotBuffer = await page.screenshot({ type: "jpeg", quality: 75 });
    const screenshot = screenshotBuffer.toString("base64");

    return {
      success: true,
      sessionId: session.sessionId,
      message: `Action completed: ${instruction}`,
      data,
      screenshot,
      url: page.url(),
    };
  } catch (err) {
    // Still try to screenshot on failure for debugging
    let screenshot: string | undefined;
    try {
      const buf = await page.screenshot({ type: "jpeg", quality: 75 });
      screenshot = buf.toString("base64");
    } catch {
      // ignore screenshot failure
    }

    return {
      success: false,
      sessionId: session.sessionId,
      message: `Action failed: ${err instanceof Error ? err.message : String(err)}`,
      screenshot,
      url: page.url(),
    };
  }
}
