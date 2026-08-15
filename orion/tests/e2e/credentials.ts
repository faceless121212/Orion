type E2EEnvSource = Record<string, string | undefined>;

export function readE2ECredentials(source: E2EEnvSource) {
  const adminEmail = source.E2E_ADMIN_EMAIL;
  const adminPassword = source.E2E_ADMIN_PASSWORD;
  const userEmail = source.E2E_USER_EMAIL;
  const userPassword = source.E2E_USER_PASSWORD;

  if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
    throw new Error(
      "Authenticated E2E credentials are not configured. Add all E2E_ADMIN_* and E2E_USER_* variables.",
    );
  }

  return {
    admin: { email: adminEmail, password: adminPassword },
    user: { email: userEmail, password: userPassword },
  };
}
