/**
 * Quick email test — creates an inbox, sends an email to itself, reads it back.
 *
 * Run: npx tsx src/email/test.ts
 */
import { createInbox, sendEmail, listEmails, waitForEmail } from "./email-tool.js";

async function main() {
  console.log("=== Email Test ===\n");

  // Test 1: Create inbox
  console.log("1. Creating inbox...");
  const inbox = await createInbox("test-agent");
  console.log(`   Inbox ID: ${inbox.inboxId}`);

  // Test 2: Send email to self
  console.log("\n2. Sending email to self...");
  const sent = await sendEmail(
    inbox.inboxId,
    inbox.inboxId, // send to self
    "Test Email from AI Agent",
    "Hello! This is a test email sent by the AI Founder Agent."
  );
  console.log(`   Message ID: ${sent.messageId}`);
  console.log(`   Thread ID: ${sent.threadId}`);

  // Test 3: Wait for the email
  console.log("\n3. Waiting for email to arrive...");
  const received = await waitForEmail(inbox.inboxId, {
    timeout: 30_000,
    interval: 3_000,
    subjectContains: "Test Email",
  });
  console.log(`   Received: "${received.subject}"`);
  console.log(`   From: ${received.from}`);
  console.log(`   Body: ${received.text.slice(0, 100)}`);

  // Test 4: List all emails
  console.log("\n4. Listing all emails...");
  const allEmails = await listEmails(inbox.inboxId);
  console.log(`   Total emails: ${allEmails.length}`);
  for (const email of allEmails) {
    console.log(`   - "${email.subject}" from ${email.from}`);
  }

  console.log("\n=== Email Test Complete ===");
}

main().catch((err) => {
  console.error("Email test failed:", err);
  process.exit(1);
});
