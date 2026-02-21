/**
 * Test email automation with test recipients
 */
import { sendEmail } from "./agent-email.js";
import { sendOutreachEmail, ProductSpec } from "./outreach-generator.js";
import { TEST_RECIPIENTS, getTestRecipients } from "./test-recipients.js";

// Sample product spec for testing
const testProductSpec: ProductSpec = {
  productName: "TaskFlow Pro",
  description: "AI-powered task management for distributed teams",
  problem: "Remote teams struggle with task coordination across time zones and scattered communication channels",
  targetAudience: "Remote-first companies and distributed engineering teams",
  features: {
    mvp: [
      "Real-time task synchronization",
      "AI-powered priority recommendations",
      "Slack and Discord integrations",
      "Time zone aware scheduling",
      "Team collaboration boards"
    ],
    future: [
      "Automated standup reports",
      "Voice command integration",
      "Custom workflow automation"
    ]
  },
  business: {
    monetization: "Subscription - $15/user/month (free for teams under 5)",
    payments: true
  },
  timeline: "Q2 2026"
};

async function testSimpleEmail() {
  console.log("\n=== Test 1: Simple Email ===");

  const result = await sendEmail(
    TEST_RECIPIENTS[0],
    "Test: Simple Email from Founder Agent",
    "This is a test email from the Founder Agent automation system.\n\nTesting basic email functionality.\n\nBest regards,\nFounder Agent"
  );

  console.log(`✅ Sent to ${TEST_RECIPIENTS[0]}`);
  console.log(`   Message ID: ${result.messageId}`);
}

async function testHTMLEmail() {
  console.log("\n=== Test 2: HTML Email ===");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; }
    h1 { color: #2563eb; }
    .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <h1>🚀 Test: HTML Email</h1>
  <p>This is a <strong>rich HTML email</strong> from the Founder Agent automation system.</p>

  <div class="highlight">
    <p><strong>✨ Features Being Tested:</strong></p>
    <ul>
      <li>Custom HTML formatting</li>
      <li>Inline CSS styling</li>
      <li>Professional email layout</li>
    </ul>
  </div>

  <p>Best regards,<br>Founder Agent Team</p>
</body>
</html>`;

  const result = await sendEmail(
    TEST_RECIPIENTS[1],
    "Test: HTML Email from Founder Agent",
    "This is the plain text version",
    htmlContent
  );

  console.log(`✅ Sent to ${TEST_RECIPIENTS[1]}`);
  console.log(`   Message ID: ${result.messageId}`);
}

async function testOutreachEmail() {
  console.log("\n=== Test 3: Outreach Email (Single Recipient) ===");

  await sendOutreachEmail(testProductSpec, TEST_RECIPIENTS[0]);
  console.log(`✅ Outreach email sent to ${TEST_RECIPIENTS[0]}`);
}

async function testOutreachEmailMultiple() {
  console.log("\n=== Test 4: Outreach Email (Multiple Recipients) ===");

  await sendOutreachEmail(testProductSpec, getTestRecipients());
  console.log(`✅ Outreach emails sent to all test recipients`);
}

async function main() {
  console.log("=== Email Automation Testing ===");
  console.log(`Test recipients: ${TEST_RECIPIENTS.join(", ")}\n`);

  try {
    // Test 1: Simple plain text email
    await testSimpleEmail();

    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: HTML email
    await testHTMLEmail();

    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Outreach email to single recipient
    await testOutreachEmail();

    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Outreach email to multiple recipients
    await testOutreachEmailMultiple();

    console.log("\n=== All Tests Complete ===");
    console.log("✅ Email automation is working correctly");
    console.log("📧 Check your test inboxes for the emails");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  });
}

export { testSimpleEmail, testHTMLEmail, testOutreachEmail, testOutreachEmailMultiple };
