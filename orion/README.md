# Orion

Orion is a secure, single-company dashboard for assigning AI agents to employees and running document-producing missions.

## Try it without Supabase (demo mode)

```bash
npm install
npm run dev:demo
```

Open [http://localhost:3000](http://localhost:3000) and pick a persona: Alex (admin) or one of three employees. Demo mode swaps Supabase for an in-memory workspace seeded with a company, agents, squads, missions, usage, and Google Drive files. Every screen and form works, including running missions: a run finishes after about 8 seconds, and a brief containing `#fail` fails so you can try retry. Data resets when the server restarts. Switch personas from the header.

Demo mode only activates when `ORION_DEMO=1` **and** the server is not a production build, so it can never bypass real sign-in in a deployment.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your Supabase project URL and keys.

3. In the Supabase SQL editor, run in order:

   - `supabase/migrations/20260814000100_create_profiles.sql`
   - `supabase/migrations/20260929000100_admin_configuration.sql`
   - `supabase/migrations/20260929000200_workspace_data.sql` (missions, usage, integrations, knowledge, profile fields, and the `avatars` storage bucket)
   - `supabase/promote-first-user.sql` after replacing its example email

4. Set `REGISTRATION_ALLOWED_EMAILS` to the comma-separated email addresses that may register. Registration fails closed when this value is missing.

5. Optional: set `SUPABASE_SERVICE_ROLE_KEY` (server only) so Orion can record usage events, which users cannot write themselves. Without it everything works but prompt-generation usage is not recorded.

6. Optional: set `ANTHROPIC_API_KEY` to enable "Generate with AI" in the agent editor. Everything else works without it; the button explains what is missing.

7. Start Orion and keep this terminal running:

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
