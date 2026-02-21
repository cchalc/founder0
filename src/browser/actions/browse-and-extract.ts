import { type ZodTypeAny, type z } from "zod";
import { createSession, getSession, closeSession } from "../session-manager.js";

export interface BrowseAndExtractOptions {
  sessionId?: string;
}

/**
 * Navigate to a URL and extract structured data using Stagehand extract with a Zod schema.
 */
export async function browseAndExtract<T extends ZodTypeAny>(
  url: string,
  instruction: string,
  schema: T,
  options: BrowseAndExtractOptions = {}
): Promise<z.infer<T>> {
  const { sessionId } = options;

  const session = sessionId
    ? getSession(sessionId) ?? (await createSession())
    : await createSession();

  const { stagehand } = session;
  const page = stagehand.context.pages()[0];

  await page.goto(url, { waitUntil: "domcontentloaded", timeoutMs: 30_000 });

  const data = await stagehand.extract(instruction, schema);
  return data;
}
