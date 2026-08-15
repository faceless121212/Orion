export function isRegistrationAllowed(
  email: string,
  configuredEmails: string | undefined,
) {
  if (!configuredEmails) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = configuredEmails
    .split(",")
    .map((allowedEmail) => allowedEmail.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(normalizedEmail);
}
