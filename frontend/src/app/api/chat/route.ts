import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Kimi API configuration (OpenAI-compatible)
const KIMI_API_KEY = process.env.KIMI_API_KEY!;
const KIMI_API_URL = "https://api.moonshot.ai/v1/chat/completions"; // Changed to .ai for international
const KIMI_MODEL = "moonshot-v1-8k"; // or moonshot-v1-32k, moonshot-v1-128k

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

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Helper function to call Kimi API
async function callKimi(messages: Message[], systemPrompt?: string) {
  const apiMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  console.log("Kimi API Key (first 10 chars):", KIMI_API_KEY?.substring(0, 10));
  console.log("Kimi API URL:", KIMI_API_URL);
  console.log("Kimi Model:", KIMI_MODEL);

  const response = await fetch(KIMI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: apiMessages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Kimi API Error Response:", errorBody);
    throw new Error(`Kimi API error: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Extract structured data from conversation
async function extractStructuredData(messages: Message[]) {
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

  const conversationMessages = [
    ...messages.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user" as const,
      content: extractionPrompt,
    },
  ];

  const jsonText = await callKimi(
    conversationMessages,
    "You are a data extraction assistant. Extract information into valid JSON format only."
  );

  try {
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
}

// Generate spec.md content
function generateSpecMarkdown(data: any) {
  const now = new Date().toISOString().split("T")[0];

  return `# Product Specification: ${data.productName || "Untitled Project"}

**Generated:** ${now}

## Overview

**Product Name:** ${data.productName || "TBD"}

**Description:** ${data.description || "TBD"}

**Problem Statement:** ${data.problem || "TBD"}

**Target Audience:** ${data.targetAudience || "TBD"}

---

## Features

### MVP Features (Must-Have)
${data.features?.mvp?.map((f: string) => `- ${f}`).join("\n") || "- TBD"}

### Future Features (Nice-to-Have)
${data.features?.future?.map((f: string) => `- ${f}`).join("\n") || "- TBD"}

---

## Technical Requirements

**Platform:** ${data.techStack?.platform || "TBD"}

**Tech Stack Preferences:** ${data.techStack?.preferences || "None specified"}

**Third-Party Integrations:**
${data.techStack?.integrations?.map((i: string) => `- ${i}`).join("\n") || "- None specified"}

**Authentication:** ${data.techStack?.authentication || "TBD"}

**Database:** ${data.techStack?.database || "TBD"}

---

## Design & UX

**Design Style:** ${data.design?.style || "TBD"}

**Key Pages/Screens:**
${data.design?.pages?.map((p: string) => `- ${p}`).join("\n") || "- TBD"}

**Branding:** ${data.design?.branding || "TBD"}

---

## Business Requirements

**Monetization Strategy:** ${data.business?.monetization || "TBD"}

**Payment Processing:** ${data.business?.payments ? "Required" : "Not required"}

**Analytics:** ${data.business?.analytics || "Not specified"}

---

## Timeline & Scope

**Target Launch:** ${data.timeline || "TBD"}

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

// Generate outreach email from spec data
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

- Early adopters
- Beta testers
- Industry contacts
- Potential partners
- Investors

---

*Auto-generated from product specification*
`;
}

// Save spec to projects directory (append to existing spec.md)
async function saveSpec(data: any) {
  const projectsDir = path.join(process.cwd(), "..", "projects");
  const specPath = path.join(projectsDir, "spec.md");

  // Create projects directory
  await fs.mkdir(projectsDir, { recursive: true });

  // Generate new spec content
  const newSpecContent = generateSpecMarkdown(data);

  // Check if spec.md already exists
  let existingContent = "";
  try {
    existingContent = await fs.readFile(specPath, "utf-8");
  } catch (error) {
    // File doesn't exist yet, will create new one
  }

  // Prepare content to append
  let finalContent;
  if (existingContent) {
    // Append with separator
    const separator = `\n\n${"=".repeat(80)}\n${"=".repeat(80)}\n\n`;
    finalContent = existingContent + separator + newSpecContent;
  } else {
    // First entry
    finalContent = newSpecContent;
  }

  // Save updated spec.md
  await fs.writeFile(specPath, finalContent, "utf-8");

  // Save individual JSON snapshot with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const projectName = data.productName
    ? data.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "untitled";
  const jsonFileName = `${projectName}-${timestamp}.json`;
  const jsonPath = path.join(projectsDir, jsonFileName);
  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), "utf-8");

  // Generate and save outreach email
  const outreachEmail = generateOutreachEmail(data);
  const emailFileName = `${projectName}-outreach-${timestamp}.md`;
  const emailPath = path.join(projectsDir, emailFileName);
  await fs.writeFile(emailPath, outreachEmail, "utf-8");
  console.log(`[spec] Generated outreach email: ${emailFileName}`);

  return { projectDir: projectsDir, specPath, projectName: "spec" };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, initialGreeting, generateIdea } = body;

    // Handle project idea generation
    if (generateIdea) {
      const ideaPrompt = `Generate a random, creative B2C product idea. Be specific and interesting. Include:
1. Product name
2. One-sentence description
3. What problem it solves
4. Target audience

Format your response as a natural conversational pitch, as if you're excitedly telling someone about this idea. Keep it to 3-4 sentences.`;

      const idea = await callKimi(
        [{ role: "user", content: ideaPrompt }],
        "You are a creative product idea generator. Generate interesting, viable product ideas."
      );

      const greeting =
        "I've generated a product idea for you! Let me tell you about it...";

      return NextResponse.json({
        greeting,
        idea,
        complete: false,
      });
    }

    // Handle initial greeting
    if (initialGreeting) {
      const assistantMessage = await callKimi(
        [
          {
            role: "user",
            content:
              "Hello! I'm ready to learn about my product idea. Please greet me and start the interview.",
          },
        ],
        SYSTEM_PROMPT
      );

      return NextResponse.json({
        message: assistantMessage,
        complete: false,
      });
    }

    // Regular conversation
    const assistantMessage = await callKimi(
      messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
      SYSTEM_PROMPT
    );

    // Check if spec is complete
    if (assistantMessage.includes("SPEC_COMPLETE")) {
      console.log("Spec complete, extracting data...");

      // Extract structured data
      const structuredData = await extractStructuredData([
        ...messages,
        { role: "assistant", content: assistantMessage },
      ]);

      if (structuredData) {
        console.log("Saving spec...");
        const { projectPath, projectName } = await saveSpec(structuredData);

        return NextResponse.json({
          message: assistantMessage.replace("SPEC_COMPLETE", "").trim(),
          complete: true,
          projectPath: projectName,
        });
      }
    }

    return NextResponse.json({
      message: assistantMessage,
      complete: false,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
