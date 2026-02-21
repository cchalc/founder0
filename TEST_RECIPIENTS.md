# Test Recipients for Email Automation

Test email addresses for validating the Founder Agent email automation functionality.

## Test Email Addresses

1. **chris.chalcraft@gmail.com** - Primary test recipient
2. **founder0testing@gmail.com** - Secondary test recipient

## Available Formats

### JSON Format
```bash
cat test-recipients.json
```

### Plain Text Format
```bash
cat test-recipients.txt
```

### TypeScript Module
```typescript
import { TEST_RECIPIENTS, getTestRecipients } from './src/email/test-recipients.js';

console.log(TEST_RECIPIENTS);
// ["chris.chalcraft@gmail.com", "founder0testing@gmail.com"]

const recipients = getTestRecipients();
// Returns a copy of the array
```

## Running Tests

### Full Test Suite
Run all email automation tests:

```bash
npx tsx src/email/test-automation.ts
```

This will send:
1. ✅ Simple plain text email to chris.chalcraft@gmail.com
2. ✅ HTML formatted email to founder0testing@gmail.com
3. ✅ Product outreach email to chris.chalcraft@gmail.com
4. ✅ Product outreach emails to both recipients

### Quick Manual Tests

**Send to single recipient:**
```bash
npx tsx -e "
import { sendEmail } from './src/email/agent-email.js';
await sendEmail(
  'chris.chalcraft@gmail.com',
  'Manual Test',
  'This is a manual test email'
);
console.log('✅ Sent!');
"
```

**Send to multiple recipients:**
```bash
npx tsx -e "
import { sendEmail } from './src/email/agent-email.js';
import { getTestRecipients } from './src/email/test-recipients.js';

for (const recipient of getTestRecipients()) {
  await sendEmail(recipient, 'Bulk Test', 'Testing multiple recipients');
  console.log(\`✅ Sent to \${recipient}\`);
}
"
```

**Send outreach email:**
```bash
npx tsx -e "
import { sendOutreachEmail } from './src/email/outreach-generator.js';
import { TEST_RECIPIENTS } from './src/email/test-recipients.js';

const spec = {
  productName: 'TestProduct',
  description: 'A test product',
  problem: 'Testing is manual',
  targetAudience: 'Developers',
  features: { mvp: ['Feature 1', 'Feature 2'], future: [] },
  business: { monetization: 'free', payments: false },
  timeline: null
};

await sendOutreachEmail(spec, TEST_RECIPIENTS);
console.log('✅ Sent outreach emails!');
"
```

## Integration with Automation

### In Code
```typescript
import { sendEmail } from './src/email/agent-email.js';
import { TEST_RECIPIENTS } from './src/email/test-recipients.js';

// Test automation flow
async function testEmailFlow() {
  for (const recipient of TEST_RECIPIENTS) {
    await sendEmail(
      recipient,
      'Automated Test',
      'This email was sent by automation'
    );
  }
}
```

### In Agent Workflow
The test recipients can be used in the agent workflow for:
- Testing outreach email generation
- Validating email templates
- Testing email delivery
- QA before sending to real users

## Safety Notes

✅ **Safe to use** - These are designated test addresses
✅ **No rate limits** - Only 2 addresses, well within limits
✅ **Inbox control** - Both owned by the team
✅ **No spam risk** - Testing only, controlled sending

## Checking Results

After sending test emails:

1. **Check Gmail inbox:**
   - chris.chalcraft@gmail.com
   - founder0testing@gmail.com

2. **Verify email content:**
   - Subject line correct
   - Body text formatted properly
   - HTML rendering (if applicable)
   - Links work (if included)

3. **Check spam folder:**
   - Ensure emails aren't marked as spam
   - Verify sender reputation

## Troubleshooting

**Emails not received?**
- Check spam/junk folders
- Verify API key is valid in `.env`
- Check inbox ID is correct: `cursorhack@agentmail.to`
- Review server logs for errors

**HTML not rendering?**
- Check email client (some clients disable HTML)
- View email source to see HTML
- Test in different email clients

**Rate limit errors?**
- Wait 1 second between sends (built into automation)
- Reduce number of test emails
- Check AgentMail account limits

---

**Ready to test!** Run `npx tsx src/email/test-automation.ts` to start testing.
