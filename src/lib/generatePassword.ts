import { randomBytes } from 'node:crypto';

// New staff/school accounts are created by an admin, not self-registered — there's no
// email-sending infra wired for account invites (Resend is only used for the
// application-submitted notification per the spec), so account creation generates a
// one-time password and returns it in the API response for the admin to hand off directly.
export function generatePassword(): string {
  return randomBytes(9).toString('base64url');
}
