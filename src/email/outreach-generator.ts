/**
 * Generate outreach emails from product specs
 */
import { sendEmail } from "./agent-email.js";

export interface ProductSpec {
  productName: string;
  description: string;
  problem: string;
  targetAudience: string;
  features: {
    mvp: string[];
    future: string[];
  };
  business: {
    monetization: string;
    payments: boolean;
  };
  timeline: string | null;
}

/**
 * Generate an outreach email from a product spec
 */
export function generateOutreachEmail(spec: ProductSpec): {
  subject: string;
  body: string;
  htmlBody: string;
} {
  const subject = `Introducing ${spec.productName} - ${spec.description.slice(0, 50)}...`;

  const body = `Hi there,

I wanted to reach out about ${spec.productName}, a new solution we've built for ${spec.targetAudience}.

THE PROBLEM:
${spec.problem}

OUR SOLUTION:
${spec.description}

KEY FEATURES:
${spec.features.mvp.slice(0, 5).map(f => `• ${f}`).join('\n')}

${spec.business.monetization !== 'free' ? `PRICING:\n${spec.business.monetization}\n\n` : ''}WHY NOW:
${spec.timeline ? `We're launching ${spec.timeline} and looking for early users who can benefit from this solution.` : 'We\'re launching soon and looking for early adopters.'}

I'd love to get your feedback or set up a quick demo if this resonates with you.

Best regards,
The ${spec.productName} Team

---
Built with Founder Agent
cursorhack@agentmail.to`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    .section { margin: 20px 0; }
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { padding: 8px 0; padding-left: 20px; position: relative; }
    .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
    .cta { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h2>${spec.productName}</h2>

  <div class="section">
    <p><strong>For:</strong> ${spec.targetAudience}</p>
  </div>

  <div class="section">
    <h3>The Problem</h3>
    <p>${spec.problem}</p>
  </div>

  <div class="section">
    <h3>Our Solution</h3>
    <p>${spec.description}</p>
  </div>

  <div class="section">
    <h3>Key Features</h3>
    <ul class="feature-list">
      ${spec.features.mvp.slice(0, 5).map(f => `<li>${f}</li>`).join('\n      ')}
    </ul>
  </div>

  ${spec.business.monetization !== 'free' ? `
  <div class="section">
    <h3>Pricing</h3>
    <p>${spec.business.monetization}</p>
  </div>
  ` : ''}

  <div class="section">
    <p><strong>${spec.timeline ? `Launching ${spec.timeline}` : 'Launching soon'}</strong> - we're looking for early users who can benefit from this solution.</p>
    <a href="mailto:cursorhack@agentmail.to?subject=Interested in ${encodeURIComponent(spec.productName)}" class="cta">I'm Interested</a>
  </div>

  <div class="footer">
    <p>Built with Founder Agent | <a href="mailto:cursorhack@agentmail.to">cursorhack@agentmail.to</a></p>
  </div>
</body>
</html>`;

  return { subject, body, htmlBody };
}

/**
 * Save outreach email to a file
 */
export function formatOutreachEmailForFile(spec: ProductSpec): string {
  const email = generateOutreachEmail(spec);

  return `# Outreach Email Template for ${spec.productName}

Generated: ${new Date().toISOString().split('T')[0]}

---

## Email Subject

\`\`\`
${email.subject}
\`\`\`

---

## Email Body (Plain Text)

\`\`\`
${email.body}
\`\`\`

---

## Email Body (HTML)

\`\`\`html
${email.htmlBody}
\`\`\`

---

## Usage Instructions

### Send via Code
\`\`\`typescript
import { sendEmail } from './src/email/agent-email.js';

await sendEmail(
  'recipient@example.com',
  '${email.subject}',
  \`${email.body.replace(/`/g, '\\`')}\`
);
\`\`\`

### Send via Command Line
\`\`\`bash
npx tsx -e "
import { sendEmail } from './src/email/agent-email.js';
await sendEmail(
  'recipient@example.com',
  '${email.subject.replace(/'/g, "\\'")}',
  \`${email.body.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`
);
"
\`\`\`

### Target Audience
${spec.targetAudience}

### Suggested Recipients
- Early adopters in your target market
- Beta testers
- Industry influencers
- Potential investors
- Partner companies

---

*This email was auto-generated from your product specification.*
*Customize as needed before sending.*
`;
}

/**
 * Send outreach email to a list of recipients
 */
export async function sendOutreachEmail(
  spec: ProductSpec,
  recipients: string | string[]
): Promise<void> {
  const email = generateOutreachEmail(spec);
  const recipientList = Array.isArray(recipients) ? recipients : [recipients];

  console.log(`[outreach] Sending to ${recipientList.length} recipient(s)...`);

  for (const recipient of recipientList) {
    await sendEmail(recipient, email.subject, email.body);
    console.log(`[outreach] Sent to ${recipient}`);
    // Rate limit: wait 1 second between sends
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`[outreach] All emails sent successfully`);
}
