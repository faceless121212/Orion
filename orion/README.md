# Orion

Orion is a secure, single-company dashboard for assigning AI agents to employees and running document-producing missions.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your Supabase project URL and keys.

3. In the Supabase SQL editor, run:

   - `supabase/migrations/20260814000100_create_profiles.sql`
   - `supabase/promote-first-user.sql` after replacing its example email

4. Set `REGISTRATION_ALLOWED_EMAILS` to the comma-separated email addresses that may register. Registration fails closed when this value is missing.

5. Start Orion and keep this terminal running:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). If the terminal process stops, localhost will refuse the connection until `npm run dev` is started again.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Authenticated browser tests require dedicated admin and user accounts through the four `E2E_*` variables shown in `.env.example`. The test suite fails rather than silently skipping role checks when they are absent.
The same accounts exercise profile row-level security, including blocked user role elevation.

GitHub Actions uses these repository secrets:

- `ORION_E2E_SUPABASE_URL`
- `ORION_E2E_SUPABASE_PUBLISHABLE_KEY`
- `ORION_E2E_USER_EMAIL`
- `ORION_E2E_USER_PASSWORD`
- `ORION_E2E_ADMIN_EMAIL`
- `ORION_E2E_ADMIN_PASSWORD`

Never commit `.env.local`, Supabase service-role keys, or provider API keys.
