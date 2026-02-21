/**
 * Test outreach email generation with mock data
 */
import fs from "fs/promises";
import path from "path";

// Mock spec data (simulates what the chat generates)
const mockSpec = {
  productName: "TaskFlow",
  description: "A real-time task management platform designed for distributed remote teams to collaborate seamlessly across time zones",
  problem: "Remote teams struggle with task visibility and coordination across different time zones, leading to duplicated work, missed deadlines, and poor communication",
  targetAudience: "Remote-first companies with 10-50 employees, particularly in tech, consulting, and creative agencies",
  features: {
    mvp: [
      "Real-time task synchronization across all devices",
      "Time zone-aware notifications and deadlines",
      "Integrated video chat for quick discussions",
      "Visual timeline view of all projects",
      "Slack and Microsoft Teams integration"
    ],
    future: [
      "AI-powered task prioritization",
      "Automated time tracking",
      "Mobile apps for iOS and Android",
      "Custom workflow automation"
    ]
  },
  techStack: {
    platform: "web",
    preferences: "React, Node.js, PostgreSQL",
    integrations: ["Slack", "Microsoft Teams", "Google Calendar"],
    authentication: "OAuth 2.0 with SSO support",
    database: "PostgreSQL with Redis caching"
  },
  design: {
    style: "Modern and minimalist with focus on clarity",
    pages: ["Dashboard", "Project Timeline", "Task Details", "Team Chat", "Settings"],
    branding: "Blue and white color scheme, clean typography"
  },
  business: {
    monetization: "Freemium model - Free for teams up to 5, $10/user/month for unlimited",
    payments: true,
    analytics: "Mixpanel for user behavior tracking"
  },
  timeline: "Q2 2026"
};

// Generate outreach email function (matches what's in chat API)
function generateOutreachEmail(data: any): string {
  const subject = `Introducing ${data.productName || 'Our New Product'}`;

  const body = `Hi there,

I wanted to reach out about ${data.productName || 'our new product'}, a solution built for ${data.targetAudience || 'users like you'}.

THE PROBLEM:
${data.problem || 'Common pain points in the market'}

OUR SOLUTION:
${data.description || 'A better way to solve this problem'}

KEY FEATURES:
${data.features?.mvp?.slice(0, 5).map((f: string) => `• ${f}`).join('\n') || '• Coming soon'}

${data.business?.monetization && data.business.monetization !== 'free' ? `PRICING:\n${data.business.monetization}\n\n` : ''}WHY NOW:
${data.timeline ? `We're launching ${data.timeline} and looking for early users.` : 'We\'re launching soon and looking for early adopters.'}

I'd love to get your feedback or set up a quick demo if this resonates with you.

Best regards,
The ${data.productName || 'Product'} Team

---
Built with Founder Agent
Reply to: cursorhack@agentmail.to`;

  return `# Outreach Email for ${data.productName || 'Product'}

**Generated:** ${new Date().toISOString().split('T')[0]}

---

## Subject Line

\`\`\`
${subject}
\`\`\`

---

## Email Body

\`\`\`
${body}
\`\`\`

---

## How to Send

### Option 1: Send via email tool
\`\`\`bash
cd /Users/christopher.chalcraft/cowork/cursorhack/founder0
npx tsx -e "
import { sendEmail } from './src/email/agent-email.js';
await sendEmail('recipient@example.com', '${subject}', \`${body.replace(/`/g, '\\`')}\`);
console.log('Email sent!');
"
\`\`\`

### Option 2: Copy and paste
1. Copy the email body above
2. Send from cursorhack@agentmail.to
3. Personalize as needed

---

## Target Audience

${data.targetAudience || 'General audience'}

## Suggested Recipients

- Early adopters in remote-first companies
- Tech company founders
- Remote team managers
- HR directors at distributed companies
- SaaS industry contacts

---

*Auto-generated from product specification*
`;
}

async function main() {
  console.log("=== Testing Outreach Email Generation ===\n");

  // Simulate the frontend workflow
  console.log("1. Mock spec data created ✅");
  console.log(`   Product: ${mockSpec.productName}`);
  console.log(`   Target: ${mockSpec.targetAudience}\n`);

  // Generate the outreach email
  console.log("2. Generating outreach email...");
  const outreachEmail = generateOutreachEmail(mockSpec);

  // Save to projects directory (simulating what the API does)
  const projectsDir = path.join(process.cwd(), "projects");
  await fs.mkdir(projectsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `taskflow-outreach-${timestamp}.md`;
  const filepath = path.join(projectsDir, filename);

  await fs.writeFile(filepath, outreachEmail, "utf-8");
  console.log(`   ✅ Saved to: projects/${filename}\n`);

  // Display the email
  console.log("3. Generated Outreach Email:\n");
  console.log("=".repeat(80));
  console.log(outreachEmail);
  console.log("=".repeat(80));

  console.log("\n=== Test Complete ===");
  console.log(`✅ Email saved to: ${filepath}`);
  console.log("✅ Ready to send to potential customers");
  console.log("\nNext steps:");
  console.log("1. Review the email in projects/ folder");
  console.log("2. Customize for specific recipients");
  console.log("3. Send using the instructions in the file");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
