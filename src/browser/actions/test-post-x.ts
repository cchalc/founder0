import { postToX } from "./post-to-x.js";
import { closeAllSessions } from "../session-manager.js";
import "dotenv/config";

async function main() {
  console.log("=== X Posting Test ===\n");

  const username = process.env.X_BURNER_USERNAME;
  const password = process.env.X_BURNER_PASSWORD;

  if (!username || !password) {
    console.error("Set X_BURNER_USERNAME and X_BURNER_PASSWORD in .env");
    process.exit(1);
  }

  console.log(`Logging in as @${username} and posting a test tweet...\n`);

  const result = await postToX({
    username,
    password,
    text: `Hello from the AI Founder Agent! 🤖 [test ${Date.now()}]`,
  });

  console.log(`\nResult:`);
  console.log(`  Success:  ${result.success}`);
  console.log(`  Message:  ${result.message}`);
  console.log(`  URL:      ${result.url}`);
  console.log(`  Session:  ${result.sessionId}`);
  console.log(`  Screenshot: ${result.screenshot ? `${result.screenshot.length} chars base64` : "none"}`);

  await closeAllSessions();
  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  closeAllSessions().finally(() => process.exit(1));
});
