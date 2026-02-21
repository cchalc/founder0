/**
 * Quick test - just create an inbox and verify API key works
 */
import { createInbox } from "./email-tool.js";

async function main() {
  console.log("Testing AgentMail API key...\n");

  try {
    const inbox = await createInbox("founder-agent");
    console.log("✅ SUCCESS! API key is valid!");
    console.log(`📧 Inbox created: ${inbox.inboxId}`);
    console.log(`\nYou can now send emails to: ${inbox.inboxId}`);
    console.log(`\nNext steps:`);
    console.log(`1. Send a test email to ${inbox.inboxId} from your personal email`);
    console.log(`2. Use the email functions in your agent to send/receive emails`);
  } catch (error: any) {
    console.error("❌ FAILED!");
    console.error("Error:", error.message);

    if (error.statusCode === 401) {
      console.error("\n💡 Your API key may be invalid. Check https://www.agentmail.to/");
    }
  }
}

main();
