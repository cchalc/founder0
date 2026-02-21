/**
 * Manage Browserbase Contexts for persisting cookies/auth across sessions.
 *
 * Stores the context ID in a local .browserbase-context file so it can be
 * reused across runs without needing env vars.
 */
import Browserbase from "@browserbasehq/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

// Always resolve relative to the project root (where this file lives), not CWD
const PROJECT_ROOT = resolve(import.meta.dirname, "../..");
const CONTEXT_FILE = resolve(PROJECT_ROOT, ".browserbase-context");

let bb: Browserbase | null = null;

function getClient(): Browserbase {
  if (!bb) {
    bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
  }
  return bb;
}

/** Read a stored context ID from the local file or env var. */
export function getStoredContextId(): string | null {
  // Env var takes priority
  if (process.env.BROWSERBASE_CONTEXT_ID) {
    return process.env.BROWSERBASE_CONTEXT_ID;
  }
  // Fall back to local file
  if (existsSync(CONTEXT_FILE)) {
    return readFileSync(CONTEXT_FILE, "utf-8").trim();
  }
  return null;
}

/** Create a new Browserbase context and persist its ID locally. */
export async function createContext(): Promise<string> {
  const client = getClient();
  const ctx = await client.contexts.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
  });
  writeFileSync(CONTEXT_FILE, ctx.id);
  console.log(`[context-manager] Created context ${ctx.id}`);
  return ctx.id;
}

/** Get the existing context ID or create one if none exists. */
export async function getOrCreateContext(): Promise<string> {
  const existing = getStoredContextId();
  if (existing) {
    console.log(`[context-manager] Using existing context ${existing}`);
    return existing;
  }
  return createContext();
}
