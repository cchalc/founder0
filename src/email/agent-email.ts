/**
 * Simplified email interface for the agent
 * Uses the pre-configured cursorhack@agentmail.to inbox
 */
import { AgentMailClient } from "agentmail";
import { EMAIL_CONFIG } from "./config.js";

const client = new AgentMailClient({
  apiKey: EMAIL_CONFIG.API_KEY,
});

export interface EmailMessage {
  messageId: string;
  threadId: string;
  from: string[];
  to: string[];
  subject: string;
  text: string;
  html: string;
  timestamp: string;
}

export interface SendResult {
  messageId: string;
  threadId: string;
}

/**
 * Get the agent's inbox ID (always returns cursorhack@agentmail.to)
 */
export function getInboxId(): string {
  return EMAIL_CONFIG.INBOX_ID;
}

/**
 * Send an email from the agent's inbox
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  body: string,
  html?: string
): Promise<SendResult> {
  // Validate inputs
  const recipients = Array.isArray(to) ? to : [to];

  if (recipients.length === 0) {
    throw new Error("At least one recipient is required");
  }

  if (!subject || subject.trim().length === 0) {
    throw new Error("Subject is required");
  }

  if (!body || body.trim().length === 0) {
    throw new Error("Email body is required");
  }

  // Use provided HTML or convert plain text to HTML with preserved line breaks
  const htmlContent = html || body.replace(/\n/g, '<br>').replace(/\n\n/g, '<br><br>');

  const result = await client.inboxes.messages.send(EMAIL_CONFIG.INBOX_ID, {
    to: recipients,
    subject,
    text: body,
    html: htmlContent,
  });
  console.log(`[email] Sent email to ${recipients.join(", ")}`);
  return {
    messageId: result.messageId,
    threadId: result.threadId,
  };
}

/**
 * List all emails in the agent's inbox
 */
export async function listEmails(): Promise<EmailMessage[]> {
  const response = await client.inboxes.messages.list(EMAIL_CONFIG.INBOX_ID);
  const items = response.messages ?? [];

  const messages: EmailMessage[] = await Promise.all(
    items.map(async (item) => {
      const full = await client.inboxes.messages.get(EMAIL_CONFIG.INBOX_ID, item.messageId);
      return {
        messageId: full.messageId,
        threadId: full.threadId,
        from: Array.isArray(full.from) ? full.from.map(String) : [String(full.from)],
        to: Array.isArray(full.to) ? full.to : [String(full.to)],
        subject: full.subject ?? "",
        text: full.text ?? "",
        html: full.html ?? "",
        timestamp: String(full.timestamp ?? ""),
      };
    })
  );

  return messages;
}

/**
 * Get a specific email by ID
 */
export async function getEmail(messageId: string): Promise<EmailMessage> {
  const full = await client.inboxes.messages.get(EMAIL_CONFIG.INBOX_ID, messageId);
  return {
    messageId: full.messageId,
    threadId: full.threadId,
    from: Array.isArray(full.from) ? full.from.map(String) : [String(full.from)],
    to: Array.isArray(full.to) ? full.to : [String(full.to)],
    subject: full.subject ?? "",
    text: full.text ?? "",
    html: full.html ?? "",
    timestamp: String(full.timestamp ?? ""),
  };
}

export interface WaitForEmailOptions {
  /** Max time to wait in ms (default: 120000) */
  timeout?: number;
  /** Poll interval in ms (default: 5000) */
  interval?: number;
  /** Only match emails with subject containing this string */
  subjectContains?: string;
  /** Only match emails from this sender */
  from?: string;
}

/**
 * Poll for an incoming email matching criteria
 */
export async function waitForEmail(
  opts: WaitForEmailOptions = {}
): Promise<EmailMessage> {
  const {
    timeout = 120_000,
    interval = 5_000,
    subjectContains,
    from,
  } = opts;

  const start = Date.now();

  while (Date.now() - start < timeout) {
    const emails = await listEmails();

    const match = emails.find((email) => {
      if (subjectContains && !email.subject.toLowerCase().includes(subjectContains.toLowerCase())) {
        return false;
      }
      if (from && !email.from.some((f) => f.toLowerCase().includes(from.toLowerCase()))) {
        return false;
      }
      return true;
    });

    if (match) {
      console.log(`[email] Found matching email: "${match.subject}"`);
      return match;
    }

    console.log(`[email] Waiting for email... (${Math.round((Date.now() - start) / 1000)}s)`);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timed out waiting for email after ${timeout / 1000}s`);
}

/**
 * Reply to an email
 */
export async function replyToEmail(
  originalMessageId: string,
  replyBody: string
): Promise<SendResult> {
  // Get the original message to extract reply details
  const original = await getEmail(originalMessageId);

  const subject = original.subject.startsWith("Re: ")
    ? original.subject
    : `Re: ${original.subject}`;

  return sendEmail(original.from, subject, replyBody);
}
