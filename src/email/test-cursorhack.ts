/**
 * Test the cursorhack@agentmail.to inbox
 */
import { getInboxId, listEmails, sendEmail } from "./agent-email.js";

async function main() {
  console.log("=== Testing cursorhack@agentmail.to ===\n");

  // Show inbox
  const inboxId = getInboxId();
  console.log(`📧 Inbox: ${inboxId}`);
  console.log(`✅ No more creating new inboxes!\n`);

  // Check for emails
  console.log("Checking for emails...");
  const emails = await listEmails();

  console.log(`📬 Found ${emails.length} email(s)\n`);

  if (emails.length === 0) {
    console.log("📭 Inbox is empty");
    console.log("\nTo test:");
    console.log(`1. Send an email to: ${inboxId}`);
    console.log(`2. Run this test again`);
  } else {
    console.log("Recent emails:\n");
    emails.slice(0, 5).forEach((email, i) => {
      console.log(`${i + 1}. "${email.subject}"`);
      console.log(`   From: ${email.from.join(", ")}`);
      console.log(`   Time: ${email.timestamp}`);
      console.log(`   Preview: ${email.text.slice(0, 80)}...`);
      console.log("");
    });
  }

  console.log("=== Test Complete ===");
  console.log("✅ Email configured correctly");
  console.log("✅ Using single inbox: cursorhack@agentmail.to");
  console.log("✅ Ready for agent use");
}

main().catch((err) => {
  console.error("❌ Test failed:", err.message);
  if (err.statusCode === 404) {
    console.error("\n💡 The inbox 'cursorhack@agentmail.to' may not exist yet.");
    console.error("   Please create it at https://www.agentmail.to/ first.");
  }
  process.exit(1);
});
