// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

type FollowUp = "email-verification" | "did-claim";

interface SignupCompletion {
  signup: () => Promise<void>;
  login: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  claimDid: () => Promise<void>;
  navigateHome: () => Promise<void>;
  onFollowUpFailure: (task: FollowUp) => void;
}

/** Account creation/login are required; follow-ups must never hold navigation hostage. */
export async function completeSignup(steps: SignupCompletion): Promise<void> {
  await steps.signup();
  await steps.login();

  const followUps: [FollowUp, () => Promise<void>][] = [
    ["email-verification", steps.sendEmailVerification],
    ["did-claim", steps.claimDid],
  ];
  for (const [name, run] of followUps) {
    // Covers synchronous throws as well as rejected promises, independently of navigation.
    void Promise.resolve()
      .then(run)
      .catch(() => steps.onFollowUpFailure(name));
  }

  await steps.navigateHome();
}

export function signupErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
