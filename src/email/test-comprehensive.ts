/**
 * Comprehensive test suite for email functionality
 */
import { sendEmail, listEmails, getInboxId } from "./agent-email.js";
import { generateOutreachEmail, sendOutreachEmail, ProductSpec } from "./outreach-generator.js";

async function main() {
  console.log("=== Comprehensive Email Test Suite ===\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Configuration
  console.log("1. Testing configuration...");
  try {
    const inboxId = getInboxId();
    if (inboxId === "cursorhack@agentmail.to") {
      console.log(`   ✅ Correct inbox: ${inboxId}`);
      passed++;
    } else {
      console.log(`   ❌ Wrong inbox: ${inboxId}`);
      failed++;
    }
  } catch (err: any) {
    console.log(`   ❌ Configuration failed: ${err.message}`);
    failed++;
  }

  // Test 2: List emails
  console.log("\n2. Testing email listing...");
  try {
    const emails = await listEmails();
    console.log(`   ✅ Found ${emails.length} emails`);
    passed++;
  } catch (err: any) {
    console.log(`   ❌ Failed to list emails: ${err.message}`);
    failed++;
  }

  // Test 3: Send plain text email
  console.log("\n3. Testing plain text email...");
  try {
    const result = await sendEmail(
      "chris.chalcraft@gmail.com",
      "Test: Plain Text",
      "Line 1\nLine 2\nLine 3"
    );
    console.log(`   ✅ Sent (ID: ${result.messageId.substring(0, 30)}...)`);
    passed++;
  } catch (err: any) {
    console.log(`   ❌ Failed: ${err.message}`);
    failed++;
  }

  // Test 4: Send HTML email
  console.log("\n4. Testing HTML email...");
  try {
    const result = await sendEmail(
      "chris.chalcraft@gmail.com",
      "Test: HTML Email",
      "Plain text version",
      "<h1>HTML Version</h1><p>With formatting</p>"
    );
    console.log(`   ✅ Sent (ID: ${result.messageId.substring(0, 30)}...)`);
    passed++;
  } catch (err: any) {
    console.log(`   ❌ Failed: ${err.message}`);
    failed++;
  }

  // Test 5: Generate outreach email
  console.log("\n5. Testing outreach generation...");
  try {
    const mockSpec: ProductSpec = {
      productName: "TestProduct",
      description: "A test product for validation",
      problem: "Testing is hard",
      targetAudience: "Developers",
      features: {
        mvp: ["Feature 1", "Feature 2", "Feature 3"],
        future: ["Feature 4"]
      },
      business: {
        monetization: "Subscription - $10/month",
        payments: true
      },
      timeline: "Q2 2026"
    };

    const email = generateOutreachEmail(mockSpec);

    if (email.subject && email.body && email.htmlBody) {
      console.log(`   ✅ Generated email with subject: "${email.subject.substring(0, 40)}..."`);
      console.log(`   ✅ Body length: ${email.body.length} chars`);
      console.log(`   ✅ HTML length: ${email.htmlBody.length} chars`);
      passed++;
    } else {
      console.log(`   ❌ Missing email components`);
      failed++;
    }
  } catch (err: any) {
    console.log(`   ❌ Failed: ${err.message}`);
    failed++;
  }

  // Test 6: Send outreach email
  console.log("\n6. Testing outreach email sending...");
  try {
    const mockSpec: ProductSpec = {
      productName: "TestProduct",
      description: "A test product for validation",
      problem: "Testing is hard",
      targetAudience: "Developers",
      features: {
        mvp: ["Feature 1", "Feature 2"],
        future: []
      },
      business: {
        monetization: "free",
        payments: false
      },
      timeline: null
    };

    await sendOutreachEmail(mockSpec, "chris.chalcraft@gmail.com");
    console.log(`   ✅ Outreach email sent successfully`);
    passed++;
  } catch (err: any) {
    console.log(`   ❌ Failed: ${err.message}`);
    failed++;
  }

  // Test 7: Input validation
  console.log("\n7. Testing input validation...");
  try {
    await sendEmail([], "Subject", "Body");
    console.log(`   ❌ Should have rejected empty recipients`);
    failed++;
  } catch (err: any) {
    if (err.message.includes("recipient")) {
      console.log(`   ✅ Correctly rejects invalid input`);
      passed++;
    } else {
      console.log(`   ❌ Wrong error: ${err.message}`);
      failed++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("Test Results:");
  console.log(`✅ Passed: ${passed}/7`);
  console.log(`❌ Failed: ${failed}/7`);
  console.log("=".repeat(50));

  if (failed > 0) {
    console.log("\n❌ Some tests failed");
    process.exit(1);
  } else {
    console.log("\n✅ All tests passed!");
    console.log("✅ Email functionality is fully operational");
  }
}

main().catch((err) => {
  console.error("\n❌ Test suite crashed:", err.message);
  process.exit(1);
});
