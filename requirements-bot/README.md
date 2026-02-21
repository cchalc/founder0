# Requirements Gathering Chatbot

An AI-powered chatbot that interviews users about their product ideas and automatically generates comprehensive specification documents.

## What It Does

This chatbot:
1. Conducts an interactive interview with users about their product idea
2. Asks intelligent follow-up questions to gather comprehensive requirements
3. Extracts structured information about features, tech stack, design, and business needs
4. Generates a detailed `spec.md` file in a new project folder
5. Saves both the specification and raw data for future reference

## Setup

### Prerequisites
- Node.js (v18+)
- Anthropic API key

### Installation

1. Install dependencies:
```bash
cd requirements-bot
npm install
```

2. Set up your API key:
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

Or create a `.env` file in the project root:
```
ANTHROPIC_API_KEY=your-api-key-here
```

## Usage

Run the chatbot:
```bash
npm start
```

Or:
```bash
node chatbot.js
```

### Example Conversation Flow

```
🤖 Bot: Hi! I'm here to help you spec out your product.
         What product idea do you want to build?

You: I want to build a task management app for remote teams

🤖 Bot: Great! A task management app for remote teams.
         What's the main problem this will solve for remote teams?

You: Remote teams struggle to track who's working on what...

[conversation continues...]

✅ Requirements gathering complete!
📝 Extracting structured data...
💾 Saving specification...
✨ Done!

📁 Project folder: /projects/task-management-app
📄 Spec file: /projects/task-management-app/spec.md
```

## Information Gathered

The chatbot collects:

### Product Overview
- Product name
- Description
- Problem statement
- Target audience

### Features
- MVP (must-have) features
- Future (nice-to-have) features

### Technical Requirements
- Platform (web/mobile/desktop)
- Tech stack preferences
- Third-party integrations
- Authentication needs
- Database requirements

### Design & UX
- Design style preferences
- Key pages/screens
- Branding

### Business Requirements
- Monetization strategy
- Payment processing needs
- Analytics requirements

### Timeline
- Target launch date
- Priority constraints

## Output

For each conversation, the bot creates:

```
projects/
└── your-product-name/
    ├── spec.md              # Human-readable specification
    └── requirements.json    # Structured data (JSON)
```

### spec.md Format
- Product overview
- Feature list (MVP vs future)
- Technical requirements
- Design preferences
- Business requirements
- Timeline
- Next steps

### requirements.json Format
Raw structured data in JSON format for programmatic use.

## Tips for Best Results

1. **Be specific**: The more detail you provide, the better the spec
2. **It's okay to say "I don't know"**: The bot will note items as "TBD"
3. **Think about MVP**: Focus on what you need to launch first
4. **Ask questions**: The bot can explain technical terms or provide suggestions

## Commands

- Type your responses naturally
- Type `quit` to exit at any time

## Architecture

- **Model**: Claude Sonnet 4
- **Approach**: Multi-turn conversation with context retention
- **Data Extraction**: Structured extraction via Claude API
- **Output**: Markdown spec + JSON data

## Customization

You can customize the system prompt in `chatbot.js` to:
- Change the interview style
- Add/remove information categories
- Adjust the conversation flow
- Modify the spec.md template

## Future Enhancements

- [ ] Web UI instead of CLI
- [ ] Support for uploading reference docs/wireframes
- [ ] Integration with design tools (Figma)
- [ ] Direct handoff to code generation
- [ ] Multi-user collaboration on specs
- [ ] Template library for common product types

## Troubleshooting

**"API key not found"**
- Make sure `ANTHROPIC_API_KEY` is set in your environment
- Check that the key is valid

**"Failed to parse JSON"**
- This is rare - the conversation might have been too short
- Try running again and provide more detailed answers

**Bot asks repetitive questions**
- Be more specific in your answers
- If it's a bug, restart and try again

## License

MIT
