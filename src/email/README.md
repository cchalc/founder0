# Email Outreach Integration

Automated email generation for product specs created by the agent.

## How It Works

When the chat agent generates a product specification:
1. ✅ **Spec is saved** to `projects/spec.md`
2. ✅ **JSON is saved** to `projects/{product-name}-{timestamp}.json`
3. ✅ **Outreach email is generated** to `projects/{product-name}-outreach-{timestamp}.md`

## Email Configuration

**Inbox:** `cursorhack@agentmail.to`
**API Key:** Configured in `.env`
**No inbox creation:** Always uses the dedicated cursorhack inbox

## Generated Email Format

Each outreach email includes:
- ✉️ **Subject line** optimized for opens
- 📝 **Body copy** highlighting problem, solution, features
- 💰 **Pricing info** (if applicable)
- 🎯 **Target audience** information
- 📋 **Send instructions** (code + manual)

## Example Workflow

### 1. User chats with agent
```
User: "I want to build a task management app for remote teams"
Bot: [asks questions about features, audience, etc.]
```

### 2. Spec is generated
```
✅ spec.md updated
✅ task-management-app-2026-02-21T12-30-45.json saved
✅ task-management-app-outreach-2026-02-21T12-30-45.md created
```

### 3. Send outreach emails

**Option A: Send programmatically**
```typescript
import { sendEmail } from './src/email/agent-email.js';

await sendEmail(
  ['investor@example.com', 'partner@startup.com'],
  'Introducing TaskFlow - Smart Task Management for Remote Teams',
  'Hi there, I wanted to reach out about TaskFlow...'
);
```

**Option B: Send via CLI**
```bash
npx tsx -e "
import { sendEmail } from './src/email/agent-email.js';
await sendEmail(
  'recipient@example.com',
  'Subject',
  'Body'
);
"
```

**Option C: Copy and send manually**
Open the `*-outreach-*.md` file and copy the email body.

## Email Functions

### Simple API (agent-email.ts)

```typescript
import {
  sendEmail,
  listEmails,
  waitForEmail,
  replyToEmail,
  getInboxId
} from './src/email/agent-email.js';

// Get inbox (always cursorhack@agentmail.to)
const inbox = getInboxId();

// Send email
await sendEmail('to@example.com', 'Subject', 'Body');

// List all emails
const emails = await listEmails();

// Wait for reply
const reply = await waitForEmail({
  subjectContains: 'Re:',
  timeout: 60000
});

// Reply to an email
await replyToEmail(reply.messageId, 'Thanks!');
```

### Full API (email-tool.ts)

For advanced use cases, use the full AgentMail client:

```typescript
import { createInbox, sendEmail, listEmails } from './src/email/email-tool.js';

// Create inbox (not recommended - use cursorhack)
const inbox = await createInbox('name');

// Send with custom inbox
await sendEmail(inbox.inboxId, 'to@example.com', 'Subject', 'Body');
```

## Outreach Email Template

The auto-generated email includes:

### Structure
```markdown
# Problem Statement
Clear articulation of the pain point

# Solution
How your product solves it

# Key Features
- Feature 1
- Feature 2
- Feature 3

# Pricing (optional)
Monetization model

# Call to Action
Request for feedback/demo
```

### Customization

Edit the generated `*-outreach-*.md` file to:
- Add personal touches
- Customize for specific recipients
- Include links/demos
- Adjust tone

## Testing

### Test inbox access
```bash
npx tsx src/email/test-cursorhack.ts
```

### Test email sending
```bash
npx tsx -e "
import { sendEmail } from './src/email/agent-email.js';
await sendEmail('your-email@example.com', 'Test', 'This is a test');
console.log('Sent!');
"
```

### Check for new emails
```bash
npx tsx -e "
import { listEmails } from './src/email/agent-email.js';
const emails = await listEmails();
console.log(\`Found \${emails.length} emails\`);
"
```

## Security

✅ **API key in `.env`** (gitignored)
✅ **No keys in code**
✅ **Single dedicated inbox**
✅ **Rate limiting** (1 second between sends)

## Troubleshooting

**"Inbox not found"**
→ Verify `AGENTMAIL_INBOX=cursorhack@agentmail.to` in `.env`

**"Invalid API key"**
→ Check `AGENTMAIL_API_KEY` is correct in `.env`

**"Rate limit exceeded"**
→ Wait 1 second between sends (built-in)

**"Email not sent"**
→ Check logs for error messages
→ Verify recipient email is valid

## Files

```
src/email/
├── agent-email.ts           # Simple API (recommended)
├── config.ts                # Configuration
├── email-tool.ts            # Full AgentMail client
├── outreach-generator.ts    # Email template generator
├── test-cursorhack.ts       # Test cursorhack inbox
└── README.md                # This file

projects/
├── spec.md                  # All specs
├── {product}-{time}.json    # Structured data
└── {product}-outreach-{time}.md  # Outreach email ✨
```

## Next Steps

1. ✅ Email configured with cursorhack@agentmail.to
2. ✅ Auto-generates outreach emails
3. ⏭️ Send emails to your target audience
4. ⏭️ Track responses in cursorhack inbox
5. ⏭️ Build customer relationships

---

**Email is integrated and ready!** 🚀
