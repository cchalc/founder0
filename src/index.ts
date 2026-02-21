// Browser
export { createSession, getSession, closeSession, closeAllSessions, listSessions } from "./browser/session-manager.js";
export { browserAction, type BrowserActionResult, type BrowserActionOptions } from "./browser/browser-tool.js";

// Email
export { createInbox, sendEmail, listEmails, waitForEmail, type InboxInfo, type EmailMessage, type SendResult, type WaitForEmailOptions } from "./email/email-tool.js";

// Browser actions
export { signupForX, PhoneVerificationRequiredError, type SignupResult } from "./browser/actions/signup-x.js";
export { postToX, type PostToXOptions, type PostToXResult } from "./browser/actions/post-to-x.js";
export { browseAndExtract, type BrowseAndExtractOptions } from "./browser/actions/browse-and-extract.js";

// ---------------------------------------------------------------------------
// Tool Schemas — Person A integrates these into the agent's tool definitions
// ---------------------------------------------------------------------------

export const toolSchemas = {
  browser_action: {
    name: "browser_action",
    description:
      "Execute a natural-language instruction in a cloud Chrome browser. " +
      "Can navigate to URLs, click buttons, fill forms, extract data, and more.",
    parameters: {
      type: "object" as const,
      properties: {
        instruction: {
          type: "string",
          description: "Natural-language instruction for what to do in the browser",
        },
        url: {
          type: "string",
          description: "URL to navigate to before executing the instruction (optional)",
        },
        sessionId: {
          type: "string",
          description: "Reuse an existing browser session by ID (optional)",
        },
      },
      required: ["instruction"],
    },
  },

  create_inbox: {
    name: "create_inbox",
    description:
      "Create a new email inbox for the agent via AgentMail. " +
      "Returns an inbox ID that can be used to send/receive emails.",
    parameters: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Optional display name for the inbox",
        },
      },
      required: [],
    },
  },

  send_email: {
    name: "send_email",
    description: "Send an email from the agent's inbox.",
    parameters: {
      type: "object" as const,
      properties: {
        inboxId: {
          type: "string",
          description: "The inbox ID to send from",
        },
        to: {
          type: "string",
          description: "Recipient email address",
        },
        subject: {
          type: "string",
          description: "Email subject line",
        },
        body: {
          type: "string",
          description: "Email body text",
        },
      },
      required: ["inboxId", "to", "subject", "body"],
    },
  },

  signup_x: {
    name: "signup_x",
    description:
      "Auto-create an X (Twitter) account using AgentMail for email verification. " +
      "Falls back to burner account if phone verification is required.",
    parameters: {
      type: "object" as const,
      properties: {
        displayName: {
          type: "string",
          description: "Display name for the new X account (default: 'AI Agent')",
        },
      },
      required: [],
    },
  },

  post_to_x: {
    name: "post_to_x",
    description: "Post a tweet on X (Twitter). Logs in and posts the given text.",
    parameters: {
      type: "object" as const,
      properties: {
        username: {
          type: "string",
          description: "X username or email to log in with",
        },
        password: {
          type: "string",
          description: "X account password",
        },
        text: {
          type: "string",
          description: "The tweet text to post",
        },
      },
      required: ["username", "password", "text"],
    },
  },
} as const;
