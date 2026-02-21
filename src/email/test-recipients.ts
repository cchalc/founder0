/**
 * Test email recipients for email automation testing
 */

export const TEST_RECIPIENTS = [
  "chris.chalcraft@gmail.com",
  "founder0testing@gmail.com",
] as const;

export const PRIMARY_TEST_EMAIL = "chris.chalcraft@gmail.com";
export const SECONDARY_TEST_EMAIL = "founder0testing@gmail.com";

/**
 * Get all test recipients
 */
export function getTestRecipients(): string[] {
  return [...TEST_RECIPIENTS];
}

/**
 * Get a specific test recipient by index
 */
export function getTestRecipient(index: number): string {
  if (index < 0 || index >= TEST_RECIPIENTS.length) {
    throw new Error(`Invalid test recipient index: ${index}. Must be between 0 and ${TEST_RECIPIENTS.length - 1}`);
  }
  return TEST_RECIPIENTS[index];
}
