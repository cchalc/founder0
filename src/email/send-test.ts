/**
 * Send test email to chris.chalcraft@gmail.com
 */
import { sendEmail } from "./agent-email.js";

async function main() {
  const subject = "Introducing TaskFlow - Real-Time Task Management";

  const body = `Hi Chris,

I wanted to reach out about TaskFlow, a solution built for remote-first companies with 10-50 employees, particularly in tech, consulting, and creative agencies.

THE PROBLEM:
Remote teams struggle with task visibility and coordination across different time zones, leading to duplicated work, missed deadlines, and poor communication.

OUR SOLUTION:
A real-time task management platform designed for distributed remote teams to collaborate seamlessly across time zones.

KEY FEATURES:
• Real-time task synchronization across all devices
• Time zone-aware notifications and deadlines
• Integrated video chat for quick discussions
• Visual timeline view of all projects
• Slack and Microsoft Teams integration

PRICING:
Freemium model - Free for teams up to 5, $10/user/month for unlimited

WHY NOW:
We're launching Q2 2026 and looking for early users.

I'd love to get your feedback or set up a quick demo if this resonates with you.

Best regards,
The TaskFlow Team

---
Built with Founder Agent
This is a test email from the automated outreach system
Reply to: cursorhack@agentmail.to`;

  try {
    console.log("📤 Sending test email to chris.chalcraft@gmail.com...\n");
    console.log("Subject:", subject);
    console.log("From: cursorhack@agentmail.to\n");

    const result = await sendEmail("chris.chalcraft@gmail.com", subject, body);

    console.log("✅ Email sent successfully!\n");
    console.log("📋 Details:");
    console.log("  Message ID:", result.messageId);
    console.log("  Thread ID:", result.threadId);
    console.log("\n📧 Check your inbox at chris.chalcraft@gmail.com");
    console.log("   (May take a few seconds to arrive)");
  } catch (error: any) {
    console.error("❌ Failed to send email");
    console.error("Error:", error.message);
    if (error.statusCode) {
      console.error("Status:", error.statusCode);
    }
    process.exit(1);
  }
}

main();
