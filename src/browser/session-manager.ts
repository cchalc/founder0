import { Stagehand } from "@browserbasehq/stagehand";
import "dotenv/config";

export interface SessionInfo {
  stagehand: Stagehand;
  sessionId: string;
  createdAt: Date;
}

const sessions = new Map<string, SessionInfo>();

let sessionCounter = 0;

export async function createSession(): Promise<SessionInfo> {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    model: "openai/gpt-4o",
    browserbaseSessionCreateParams: {
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserSettings: {
        blockAds: true,
        solveCaptchas: true,
        recordSession: true,
      },
    },
    verbose: 1,
  });

  await stagehand.init();

  const sessionId =
    stagehand.browserbaseSessionID ??
    `local-${++sessionCounter}`;

  const info: SessionInfo = {
    stagehand,
    sessionId,
    createdAt: new Date(),
  };

  sessions.set(sessionId, info);
  console.log(`[session-manager] Created session ${sessionId}`);
  return info;
}

export function getSession(sessionId: string): SessionInfo | undefined {
  return sessions.get(sessionId);
}

export async function closeSession(sessionId: string): Promise<void> {
  const info = sessions.get(sessionId);
  if (!info) return;
  await info.stagehand.close();
  sessions.delete(sessionId);
  console.log(`[session-manager] Closed session ${sessionId}`);
}

export async function closeAllSessions(): Promise<void> {
  const ids = [...sessions.keys()];
  await Promise.all(ids.map((id) => closeSession(id)));
}

export function listSessions(): SessionInfo[] {
  return [...sessions.values()];
}
