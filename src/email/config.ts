/**
 * Email configuration - uses a single pre-configured inbox
 * No more creating new inboxes!
 */
import "dotenv/config";

export const EMAIL_CONFIG = {
  // Default inbox for all agent operations
  INBOX_ID: process.env.AGENTMAIL_INBOX || "cursorhack@agentmail.to",
  API_KEY: process.env.AGENTMAIL_API_KEY,
} as const;

// Validate configuration
if (!EMAIL_CONFIG.API_KEY) {
  throw new Error("AGENTMAIL_API_KEY is required in .env file");
}

console.log(`[email-config] Using inbox: ${EMAIL_CONFIG.INBOX_ID}`);
