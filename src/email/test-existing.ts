/**
 * Test with existing inbox
 */
import { listEmails } from "./email-tool.js";

// Use one of the inboxes we already created
const INBOX_ID = "encouragingelection1@agentmail.to";

async function main() {
  console.log("=== Testing Existing Inbox ===\n");
  console.log(`Inbox: ${INBOX_ID}\n`);

  console.log("Checking for emails...");
  const emails = await listEmails(INBOX_ID);

  console.log(`\n✅ Found ${emails.length} email(s)\n`);

  if (emails.length === 0) {
    console.log("📭 Inbox is empty");
    console.log("\nTo test receiving emails:");
    console.log(`1. Send an email to: ${INBOX_ID}`);
    console.log(`2. Run this test again to see it appear`);
  } else {
    console.log("📬 Recent emails:\n");
    emails.forEach((email, i) => {
      console.log(`${i + 1}. Subject: "${email.subject}"`);
      console.log(`   From: ${email.from.join(", ")}`);
      console.log(`   To: ${email.to.join(", ")}`);
      console.log(`   Time: ${email.timestamp}`);
      console.log(`   Preview: ${email.text.slice(0, 100)}...`);
      console.log("");
    });
  }

  console.log("=== AgentMail Working! ===");
  console.log(`✅ API Key Valid`);
  console.log(`✅ Can read emails`);
  console.log(`✅ Ready to use in agent`);
}

main().catch((err) => {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
});
