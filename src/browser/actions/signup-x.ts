import { createSession, closeSession } from "../session-manager.js";
import { createInbox, waitForEmail } from "../../email/email-tool.js";
import "dotenv/config";

export class PhoneVerificationRequiredError extends Error {
  constructor() {
    super("Phone verification required — falling back to burner account");
    this.name = "PhoneVerificationRequiredError";
  }
}

export interface SignupResult {
  success: boolean;
  email: string;
  inboxId: string;
  sessionId: string;
  message: string;
}

/**
 * Auto-create an X (Twitter) account:
 * 1. Create AgentMail inbox
 * 2. Navigate to X signup via Browserbase
 * 3. Fill form with agent's email
 * 4. Poll AgentMail for verification code
 * 5. Enter code in browser
 * 6. If phone verification required → throw PhoneVerificationRequiredError
 */
export async function signupForX(
  displayName: string = "AI Agent"
): Promise<SignupResult> {
  // Step 1: Create email inbox
  const inbox = await createInbox(`x-signup-${Date.now()}`);
  const email = inbox.inboxId; // e.g. "abc123@agentmail.to"
  console.log(`[signup-x] Using email: ${email}`);

  // Step 2: Create browser session and navigate to signup
  const session = await createSession();
  const { stagehand, sessionId } = session;
  const page = stagehand.context.pages()[0];

  try {
    await page.goto("https://x.com/i/flow/signup", {
      waitUntil: "domcontentloaded",
      timeoutMs: 30_000,
    });

    // Step 3: Fill signup form
    await stagehand.act("click on 'Create account' or the signup option if visible");

    await stagehand.act(`type %name% into the name field`, {
      variables: { name: displayName },
    });

    // Look for email option (X may show phone by default)
    try {
      await stagehand.act("click 'Use email instead' if visible", { timeout: 5000 });
    } catch {
      // Already showing email field
    }

    await stagehand.act(`type %email% into the email field`, {
      variables: { email },
    });

    // Fill date of birth (required by X)
    await stagehand.act("select month 'January' from the Month dropdown");
    await stagehand.act("select day '1' from the Day dropdown");
    await stagehand.act("select year '1995' from the Year dropdown");

    // Submit
    await stagehand.act("click the 'Next' button");

    // Handle customization screen
    try {
      await stagehand.act("click 'Next' or 'Skip' to proceed past any customization options", {
        timeout: 5000,
      });
    } catch {
      // May not appear
    }

    // Click sign up
    try {
      await stagehand.act("click 'Sign up' button", { timeout: 5000 });
    } catch {
      // May already be past this step
    }

    // Step 4: Check for phone verification requirement
    const pageText = (await stagehand.extract()).pageText;
    if (
      pageText.toLowerCase().includes("phone") &&
      pageText.toLowerCase().includes("verif")
    ) {
      throw new PhoneVerificationRequiredError();
    }

    // Step 5: Wait for verification code email
    console.log("[signup-x] Waiting for verification code email...");
    const verificationEmail = await waitForEmail(inbox.inboxId, {
      timeout: 120_000,
      interval: 5_000,
      subjectContains: "verification",
    });

    // Extract the code from the email (usually 6 digits)
    const codeMatch = verificationEmail.text.match(/\b(\d{5,6})\b/);
    if (!codeMatch) {
      throw new Error(
        `Could not find verification code in email: "${verificationEmail.text.slice(0, 200)}"`
      );
    }
    const code = codeMatch[1];
    console.log(`[signup-x] Got verification code: ${code}`);

    // Step 6: Enter verification code
    await stagehand.act(`type %code% into the verification code field`, {
      variables: { code },
    });
    await stagehand.act("click 'Next' or 'Verify' button");

    // Check if we landed on phone verification anyway
    const afterText = (await stagehand.extract()).pageText;
    if (
      afterText.toLowerCase().includes("phone number") &&
      afterText.toLowerCase().includes("verif")
    ) {
      throw new PhoneVerificationRequiredError();
    }

    return {
      success: true,
      email,
      inboxId: inbox.inboxId,
      sessionId,
      message: "X signup completed successfully",
    };
  } catch (err) {
    if (err instanceof PhoneVerificationRequiredError) {
      throw err; // Let caller handle fallback
    }
    // Take debug screenshot before failing
    try {
      await page.screenshot({ path: "signup-x-error.jpg", type: "jpeg" });
    } catch {
      // ignore
    }
    throw err;
  }
}

// Run directly for testing
if (process.argv[1]?.endsWith("signup-x.ts")) {
  signupForX("Founder Agent")
    .then((result) => {
      console.log("[signup-x] Result:", result);
    })
    .catch((err) => {
      if (err instanceof PhoneVerificationRequiredError) {
        console.log("[signup-x] Phone verification required, need burner account fallback");
        console.log(
          `[signup-x] Use burner: ${process.env.X_BURNER_USERNAME} / ${process.env.X_BURNER_PASSWORD}`
        );
      } else {
        console.error("[signup-x] Error:", err);
      }
      process.exit(1);
    });
}
