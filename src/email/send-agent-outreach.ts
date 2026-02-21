#!/usr/bin/env node
/**
 * Automated outreach email sender for the Founder Agent
 *
 * Usage: npx tsx src/email/send-agent-outreach.ts <spec-file.json>
 *
 * Reads a product spec JSON file and sends outreach emails to test recipients.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { sendOutreachEmail, ProductSpec, formatOutreachEmailForFile } from "./outreach-generator.js";
import { TEST_RECIPIENTS } from "./test-recipients.js";

interface AgentProductSpec {
  productName: string;
  description: string;
  problem: string;
  targetAudience: string;
  features: {
    mvp: string[];
    future?: string[];
  };
  business: {
    monetization: string;
    payments: boolean;
  };
  timeline?: string | null;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ Usage: npx tsx send-agent-outreach.ts <spec-file.json>");
    process.exit(1);
  }

  const specFile = resolve(process.cwd(), args[0]);

  console.log("=== Founder Agent Email Automation ===");
  console.log(`Reading spec from: ${specFile}`);

  // Read and parse the spec file
  let spec: AgentProductSpec;
  try {
    const content = readFileSync(specFile, "utf-8");
    spec = JSON.parse(content);
  } catch (error: any) {
    console.error(`❌ Failed to read spec file: ${error.message}`);
    process.exit(1);
  }

  // Validate required fields
  if (!spec.productName || !spec.description || !spec.problem || !spec.targetAudience) {
    console.error("❌ Spec file is missing required fields (productName, description, problem, targetAudience)");
    process.exit(1);
  }

  console.log(`\n📦 Product: ${spec.productName}`);
  console.log(`📝 Description: ${spec.description}`);
  console.log(`🎯 Target Audience: ${spec.targetAudience}`);
  console.log(`📧 Sending to: ${TEST_RECIPIENTS.join(", ")}`);

  // Convert agent spec to ProductSpec format
  const productSpec: ProductSpec = {
    productName: spec.productName,
    description: spec.description,
    problem: spec.problem,
    targetAudience: spec.targetAudience,
    features: {
      mvp: spec.features.mvp || [],
      future: spec.features.future || []
    },
    business: {
      monetization: spec.business.monetization,
      payments: spec.business.payments
    },
    timeline: spec.timeline || null
  };

  // Generate email content for file
  const emailMarkdown = formatOutreachEmailForFile(productSpec, TEST_RECIPIENTS);

  // Save email content to marketing directory
  const marketingDir = resolve(dirname(specFile), "marketing");
  if (!existsSync(marketingDir)) {
    mkdirSync(marketingDir, { recursive: true });
  }

  const emailFile = resolve(marketingDir, "outreach-email.md");
  writeFileSync(emailFile, emailMarkdown, "utf-8");
  console.log(`\n💾 Saved email content to: ${emailFile}`);

  // Send outreach emails
  try {
    console.log("\n📨 Sending outreach emails...");
    await sendOutreachEmail(productSpec, TEST_RECIPIENTS);

    console.log("\n✅ Email automation complete!");
    console.log("📧 Check the following inboxes:");
    for (const recipient of TEST_RECIPIENTS) {
      console.log(`   - ${recipient}`);
    }

    console.log(`\n📄 Email content saved to: ${emailFile}`);
    console.log("\n🎉 Product launch pipeline complete: Build → X Post → Email Outreach");

  } catch (error: any) {
    console.error(`\n❌ Failed to send emails: ${error.message}`);
    console.log(`\n💾 Email content was still saved to: ${emailFile}`);
    console.log("You can send emails manually or retry later.");
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  });
}

export { main };
