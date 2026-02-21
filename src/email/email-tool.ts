import { AgentMailClient } from "agentmail";
import "dotenv/config";

const client = new AgentMailClient({
  apiKey: process.env.AGENTMAIL_API_KEY,
});

export interface InboxInfo {
  inboxId: string;
}

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

/** Create a new email inbox for the agent. */
export async function createInbox(name?: string): Promise<InboxInfo> {
  const inbox = await client.inboxes.create({
    ...(name ? { displayName: name } : {}),
  });
  console.log(`[email] Created inbox: ${inbox.inboxId}`);
  return { inboxId: inbox.inboxId };
}

/** Send an email from the agent's inbox. */
export async function sendEmail(
  inboxId: string,
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

  const result = await client.inboxes.messages.send(inboxId, {
    to: recipients,
    subject,
    text: body,
    html: htmlContent,
  });
  console.log(`[email] Sent email from ${inboxId} to ${recipients.join(", ")}`);
  return {
    messageId: result.messageId,
    threadId: result.threadId,
  };
}

/** List emails in an inbox (fetches full message details including body text). */
export async function listEmails(inboxId: string): Promise<EmailMessage[]> {
  const response = await client.inboxes.messages.list(inboxId);
  const items = response.messages ?? [];

  // MessageItem doesn't include text/html, so fetch full Message for each
  const messages: EmailMessage[] = await Promise.all(
    items.map(async (item) => {
      const full = await client.inboxes.messages.get(inboxId, item.messageId);
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

/** Poll for an incoming email matching criteria. Returns the first match. */
export async function waitForEmail(
  inboxId: string,
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
    const emails = await listEmails(inboxId);

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
