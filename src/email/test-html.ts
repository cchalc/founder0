/**
 * Test HTML email functionality
 */
import { sendEmail } from "./agent-email.js";

async function main() {
  console.log("=== Testing HTML Email Support ===\n");

  // Test 1: Plain text with line breaks
  console.log("1. Testing plain text with line breaks...");
  const plainText = `Hello,

This is a test email.
It has multiple lines.

Best regards,
Test System`;

  const result1 = await sendEmail(
    "chris.chalcraft@gmail.com",
    "Test: Plain Text Email",
    plainText
  );
  console.log(`   ✅ Sent (Message ID: ${result1.messageId})\n`);

  // Test 2: Custom HTML
  console.log("2. Testing custom HTML email...");
  const customHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    h1 { color: #2563eb; }
    .highlight { background: #fef3c7; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Custom HTML Email</h1>
  <p>This email uses <strong>custom HTML</strong> formatting.</p>
  <div class="highlight">
    <p>✨ Highlighted section with custom styling</p>
  </div>
  <ul>
    <li>Feature 1</li>
    <li>Feature 2</li>
    <li>Feature 3</li>
  </ul>
</body>
</html>`;

  const result2 = await sendEmail(
    "chris.chalcraft@gmail.com",
    "Test: Custom HTML Email",
    "This is the plain text version",
    customHtml
  );
  console.log(`   ✅ Sent (Message ID: ${result2.messageId})\n`);

  console.log("=== Test Complete ===");
  console.log("✅ Both plain text and HTML emails sent successfully");
  console.log("📧 Check chris.chalcraft@gmail.com for both test emails");
}

main().catch((err) => {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
});
