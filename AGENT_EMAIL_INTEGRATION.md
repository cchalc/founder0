# Agent Email Integration

Automated email outreach is now integrated into the Founder Agent workflow.

## How It Works

When the agent builds a product, it will automatically:

1. **Build the product** (scaffold, plans, code)
2. **Push to GitHub**
3. **Post to X/Twitter** (social media launch)
4. **Send outreach emails** ← NEW!

## Email Automation Flow

### Step 1: Agent Creates Product Spec
The agent creates a JSON file (`outreach-spec.json`) with product details:

```json
{
  "productName": "Your Product",
  "description": "One-line description",
  "problem": "The problem it solves",
  "targetAudience": "Who it's for",
  "features": {
    "mvp": ["Feature 1", "Feature 2"],
    "future": ["Future feature"]
  },
  "business": {
    "monetization": "Pricing model",
    "payments": true
  },
  "timeline": "Q2 2026"
}
```

### Step 2: Agent Runs Email Script
The agent executes:
```bash
npx tsx ../../../src/email/send-agent-outreach.ts outreach-spec.json
```

### Step 3: Emails Are Sent
The script automatically:
- ✅ Generates professional outreach emails (plain text + HTML)
- ✅ Sends to test recipients:
  - `chris.chalcraft@gmail.com`
  - `founder0testing@gmail.com`
- ✅ Saves email copy to `marketing/outreach-email.md`
- ✅ Logs results to console

## Test Recipients

Configured in `src/email/test-recipients.ts`:
- **chris.chalcraft@gmail.com** - Primary test recipient
- **founder0testing@gmail.com** - Secondary test recipient

These are real Gmail inboxes you can check to verify delivery.

## Email Configuration

- **Sending Inbox**: `cursorhack@agentmail.to` (AgentMail)
- **API Key**: Configured in `.env` as `AGENTMAIL_API_KEY`
- **Rate Limiting**: 1 second between sends (built-in)

## Testing the Integration

### Manual Test (Without Agent)
```bash
# Create a test spec
cat > test-spec.json << 'EOF'
{
  "productName": "TestProduct",
  "description": "A test product",
  "problem": "Testing is hard",
  "targetAudience": "Developers",
  "features": {
    "mvp": ["Feature 1", "Feature 2"],
    "future": []
  },
  "business": {
    "monetization": "Free",
    "payments": false
  },
  "timeline": null
}
EOF

# Run the email automation
npx tsx src/email/send-agent-outreach.ts test-spec.json

# Clean up
rm test-spec.json
```

### Full Agent Test
```bash
cd backend
npm run server  # Start backend server

# Then in frontend, trigger an agent run with a product vision
# The agent will automatically send emails at the end
```

## Verifying Email Delivery

After the agent runs:

1. **Check Gmail inboxes**:
   - chris.chalcraft@gmail.com
   - founder0testing@gmail.com

2. **Look for**:
   - Subject: "Introducing [Product Name] - [Description]"
   - Professional HTML formatting
   - Product features and pricing
   - Call to action

3. **Check spam folder** if not in inbox

## Email Content

The generated emails include:

### Structure
- **Subject Line**: Catchy, optimized for opens
- **Problem Statement**: Clear pain point
- **Solution**: Product value proposition
- **Key Features**: Bullet list of MVP features
- **Pricing**: Business model (if applicable)
- **Call to Action**: Request for feedback/demo

### Formats
- **Plain Text**: For email clients that don't support HTML
- **Rich HTML**: Professional styling, responsive design, branded

### Saved Output
- Email content saved to `marketing/outreach-email.md`
- Includes both plain text and HTML versions
- Copy-paste ready for manual sends
- Can be customized before sending

## Files

```
src/email/
├── send-agent-outreach.ts    # Main automation script (called by agent)
├── outreach-generator.ts     # Email template generator
├── agent-email.ts            # Email sending API
├── test-recipients.ts        # Test recipient list
└── test-automation.ts        # Standalone test suite

backend/agent-core/
└── prompt.ts                 # JOB 5 added for email automation
```

## Workflow Integration

The agent's workflow is now:

```
JOB 1: Scaffold Repo
   ↓
JOB 2: Generate Plans
   ↓
JOB 3: Push to GitHub
   ↓
JOB 4: Post to X
   ↓
JOB 5: Send Outreach Emails ← NEW!
   ↓
   ✅ Complete Launch Pipeline
```

## Error Handling

If email sending fails:
- ❌ Error is logged to console
- ✅ Email content is still saved to `marketing/outreach-email.md`
- ✅ Agent continues (doesn't fail entire run)
- 📝 You can retry manually or send later

## Next Steps

### For Production Use
1. **Update Recipients**: Replace test recipients with real customer emails
2. **Customize Templates**: Edit `outreach-generator.ts` for your brand voice
3. **Add More Recipients**: Extend `test-recipients.ts` with real leads
4. **Track Opens**: Integrate email tracking (optional)

### For Testing
1. Run `npm run test:email` to verify email functionality
2. Check both Gmail inboxes after agent runs
3. Review generated email content in `marketing/outreach-email.md`

## Success Metrics

After integration, you should see:
- ✅ Emails sent successfully (message IDs in logs)
- ✅ Emails received in test inboxes
- ✅ Professional HTML formatting renders correctly
- ✅ Email content matches product details
- ✅ Marketing copy saved for reference

---

**Status**: ✅ Email automation is integrated and tested

**Last Test**: 2026-02-21 - CodeSnap test product, 2 recipients, all emails delivered successfully
