#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt for the requirements gathering bot
const SYSTEM_PROMPT = `You are a product requirements specialist AI assistant. Your job is to interview users about their product idea and gather comprehensive information to create a detailed specification document.

Your goal is to extract the following information through natural conversation:

## Required Information:
1. **Product Overview**
   - Product name
   - One-sentence description
   - Problem it solves
   - Target audience

2. **Core Features**
   - Must-have features (MVP)
   - Nice-to-have features (future)
   - User workflows/journeys

3. **Technical Requirements**
   - Platform (web, mobile, desktop)
   - Tech stack preferences (if any)
   - Third-party integrations needed
   - Authentication requirements
   - Database needs

4. **Design & UX**
   - Design style preferences (modern, minimal, colorful, professional)
   - Key pages/screens needed
   - Branding (colors, fonts if known)

5. **Business Requirements**
   - Monetization strategy (free, paid, freemium, ads)
   - Payment processing needs
   - Analytics/tracking requirements

6. **Timeline & Scope**
   - Launch timeline
   - Budget constraints (if any)
   - Must-have vs nice-to-have priorities

## Conversation Guidelines:
- Start by warmly greeting the user and explaining you'll help them spec out their product
- Ask questions one at a time or in small groups
- Be conversational and friendly, not robotic
- If the user gives vague answers, ask clarifying questions
- Adapt your questions based on their answers (e.g., if they say "mobile app", ask about iOS/Android)
- Keep track of what you've learned
- When you have enough information, summarize what you've gathered and ask if anything is missing
- Once complete, tell the user you're generating their spec document

## Important:
- DO NOT make assumptions - always ask
- If user is unsure about something, that's okay - note it as "TBD"
- Stay focused on gathering info, don't start designing or coding
- When you have all the information, end with exactly: "SPEC_COMPLETE"`;

// Conversation history
let conversationHistory = [];
let userInfo = {
  productName: null,
  description: null,
  problem: null,
  targetAudience: null,
  features: [],
  techStack: {},
  design: {},
  business: {},
  timeline: null,
  rawConversation: [],
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to call Claude API
async function callClaude(userMessage) {
  conversationHistory.push({
    role: 'user',
    content: userMessage,
  });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: conversationHistory,
  });

  const assistantMessage = response.content[0].text;

  conversationHistory.push({
    role: 'assistant',
    content: assistantMessage,
  });

  return assistantMessage;
}

// Function to extract structured data from conversation
async function extractStructuredData() {
  const extractionPrompt = `Based on our conversation, extract all the product information into a structured JSON format with these fields:
{
  "productName": "string",
  "description": "string",
  "problem": "string",
  "targetAudience": "string",
  "features": {
    "mvp": ["list of must-have features"],
    "future": ["list of nice-to-have features"]
  },
  "techStack": {
    "platform": "string (web/mobile/desktop)",
    "preferences": "string or null",
    "integrations": ["list"],
    "authentication": "string or null",
    "database": "string or null"
  },
  "design": {
    "style": "string",
    "pages": ["list of key pages"],
    "branding": "string or null"
  },
  "business": {
    "monetization": "string",
    "payments": "boolean",
    "analytics": "string or null"
  },
  "timeline": "string or null"
}

Return ONLY the JSON, no other text. Use null for unknown fields.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: 'You are a data extraction assistant. Extract information into valid JSON format only.',
    messages: [
      ...conversationHistory,
      {
        role: 'user',
        content: extractionPrompt,
      },
    ],
  });

  const jsonText = response.content[0].text;

  try {
    // Try to parse JSON, handling potential markdown code blocks
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    console.error('Raw response:', jsonText);
    return null;
  }
}

// Function to generate spec.md
function generateSpecMarkdown(data) {
  const now = new Date().toISOString().split('T')[0];

  return `# Product Specification: ${data.productName || 'Untitled Project'}

**Generated:** ${now}

## Overview

**Product Name:** ${data.productName || 'TBD'}

**Description:** ${data.description || 'TBD'}

**Problem Statement:** ${data.problem || 'TBD'}

**Target Audience:** ${data.targetAudience || 'TBD'}

---

## Features

### MVP Features (Must-Have)
${data.features?.mvp?.map(f => `- ${f}`).join('\n') || '- TBD'}

### Future Features (Nice-to-Have)
${data.features?.future?.map(f => `- ${f}`).join('\n') || '- TBD'}

---

## Technical Requirements

**Platform:** ${data.techStack?.platform || 'TBD'}

**Tech Stack Preferences:** ${data.techStack?.preferences || 'None specified'}

**Third-Party Integrations:**
${data.techStack?.integrations?.map(i => `- ${i}`).join('\n') || '- None specified'}

**Authentication:** ${data.techStack?.authentication || 'TBD'}

**Database:** ${data.techStack?.database || 'TBD'}

---

## Design & UX

**Design Style:** ${data.design?.style || 'TBD'}

**Key Pages/Screens:**
${data.design?.pages?.map(p => `- ${p}`).join('\n') || '- TBD'}

**Branding:** ${data.design?.branding || 'TBD'}

---

## Business Requirements

**Monetization Strategy:** ${data.business?.monetization || 'TBD'}

**Payment Processing:** ${data.business?.payments ? 'Required' : 'Not required'}

**Analytics:** ${data.business?.analytics || 'Not specified'}

---

## Timeline & Scope

**Target Launch:** ${data.timeline || 'TBD'}

---

## Next Steps

1. Review and validate this specification
2. Identify any missing requirements
3. Prioritize features for MVP
4. Create technical architecture design
5. Begin implementation

---

*This specification was generated through an AI-assisted requirements gathering session.*
`;
}

// Function to create project folder and save spec
async function saveSpec(data) {
  const projectName = data.productName
    ? data.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : `project-${Date.now()}`;

  const projectDir = path.join(__dirname, '..', 'projects', projectName);

  // Create project directory
  await fs.mkdir(projectDir, { recursive: true });

  // Generate spec markdown
  const specContent = generateSpecMarkdown(data);

  // Save spec.md
  const specPath = path.join(projectDir, 'spec.md');
  await fs.writeFile(specPath, specContent, 'utf-8');

  // Also save raw conversation data as JSON
  const dataPath = path.join(projectDir, 'requirements.json');
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  return { projectDir, specPath };
}

// Main conversation loop
async function runConversation() {
  console.log('\n🤖 Product Requirements Bot\n');
  console.log('Hi! I\'m here to help you spec out your product idea.');
  console.log('Let\'s have a conversation about what you want to build.\n');
  console.log('(Type "quit" to exit at any time)\n');

  // Initial message from bot
  let botMessage = await callClaude('Hello! I\'m ready to learn about your product idea.');
  console.log(`\n🤖 Bot: ${botMessage}\n`);

  let isComplete = false;

  while (!isComplete) {
    const userInput = await askQuestion('You: ');

    if (userInput.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
    }

    // Get bot response
    botMessage = await callClaude(userInput);
    console.log(`\n🤖 Bot: ${botMessage}\n`);

    // Check if spec is complete
    if (botMessage.includes('SPEC_COMPLETE')) {
      isComplete = true;
      console.log('\n✅ Requirements gathering complete!\n');
      console.log('📝 Extracting structured data...\n');

      // Extract structured data
      const structuredData = await extractStructuredData();

      if (structuredData) {
        console.log('💾 Saving specification...\n');
        const { projectDir, specPath } = await saveSpec(structuredData);

        console.log('✨ Done!\n');
        console.log(`📁 Project folder: ${projectDir}`);
        console.log(`📄 Spec file: ${specPath}\n`);
        console.log('You can now review the spec.md file and make any adjustments.\n');
      } else {
        console.log('❌ Failed to extract structured data. Please try again.\n');
      }

      rl.close();
    }
  }
}

// Start the conversation
runConversation().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
