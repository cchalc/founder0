/**
 * Test input validation
 */
import { sendEmail } from "./agent-email.js";

async function main() {
  console.log("=== Testing Input Validation ===\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Empty recipients
  try {
    await sendEmail([], "Subject", "Body");
    console.log("❌ Test 1 FAILED: Should reject empty recipients");
    failed++;
  } catch (err: any) {
    if (err.message.includes("recipient")) {
      console.log("✅ Test 1 PASSED: Rejects empty recipients");
      passed++;
    } else {
      console.log(`❌ Test 1 FAILED: Wrong error: ${err.message}`);
      failed++;
    }
  }

  // Test 2: Empty subject
  try {
    await sendEmail("test@example.com", "", "Body");
    console.log("❌ Test 2 FAILED: Should reject empty subject");
    failed++;
  } catch (err: any) {
    if (err.message.includes("Subject")) {
      console.log("✅ Test 2 PASSED: Rejects empty subject");
      passed++;
    } else {
      console.log(`❌ Test 2 FAILED: Wrong error: ${err.message}`);
      failed++;
    }
  }

  // Test 3: Empty body
  try {
    await sendEmail("test@example.com", "Subject", "");
    console.log("❌ Test 3 FAILED: Should reject empty body");
    failed++;
  } catch (err: any) {
    if (err.message.includes("body")) {
      console.log("✅ Test 3 PASSED: Rejects empty body");
      passed++;
    } else {
      console.log(`❌ Test 3 FAILED: Wrong error: ${err.message}`);
      failed++;
    }
  }

  // Test 4: Valid email should work
  try {
    const result = await sendEmail(
      "chris.chalcraft@gmail.com",
      "Validation Test",
      "This is a validation test email"
    );
    console.log(`✅ Test 4 PASSED: Valid email sent (ID: ${result.messageId.substring(0, 20)}...)`);
    passed++;
  } catch (err: any) {
    console.log(`❌ Test 4 FAILED: Valid email rejected: ${err.message}`);
    failed++;
  }

  console.log(`\n=== Results ===`);
  console.log(`✅ Passed: ${passed}/4`);
  console.log(`❌ Failed: ${failed}/4`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Test suite failed:", err.message);
  process.exit(1);
});
