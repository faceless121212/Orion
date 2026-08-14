# Orion Development Roadmap

## Goal

Build a secure, single-company dashboard where administrators configure AI agents, assign them to employees, and employees run missions that produce Google Docs, Google Sheets, or PDFs.

## Current State

Orion is a clean Next.js 16.2.11 starter with React 19, TypeScript, Tailwind CSS, and ESLint. It does not yet include shadcn/ui, Supabase, application routes, authentication, database models, Claude agent execution, Pipedream, Google Drive, or automated tests.

The supplied screenshots define the target desktop experience: a persistent sidebar, role-aware admin navigation, agent and user management, a mission board, company context, integrations, usage reporting, and profile settings.

## Phase 1 — Foundation and Product Shell

Establish the structure every later feature depends on.

- Add shadcn/ui and reproduce the shared Orion shell, navigation, typography, colors, cards, tables, dialogs, and responsive behavior.
- Add Supabase authentication, profiles, and `admin`/`user` roles.
- Protect application and admin routes on the server.
- Create placeholder routes for Missions, Usage, Agents, Company, Users, Integrations, and Settings.
- Establish database migrations, environment validation, testing conventions, and CI checks.

**Exit criterion:** An admin and a regular user can sign in, see the correct navigation, reach only authorized routes, and use the shared dashboard shell.

## Phase 2 — Admin Configuration

Give administrators control over the company's agent workspace.

- Add company context and brand guidance.
- Add agent creation and editing: name, description, model, system prompt, icon, and status.
- Add AI-assisted prompt generation using company context.
- Add user listing and agent assignment to create each employee's “My Squad.”
- Add personal agent instructions for each user-agent assignment.
- Enforce authorization in every mutation and server endpoint.

**Exit criterion:** An admin can configure company context, create an agent, assign it to an employee, and the employee sees that agent in My Squad.

## Phase 3 — Integrations and End-to-End Mission

Prove the highest-risk workflow before expanding the product surface.

- Connect one company-level Google Drive account through Pipedream.
- Connect Orion's server-side Claude Managed Agents runtime.
- Add the mission form: assigned agent, title, brief, web-search option, and output format.
- Run a mission with composed context from company, agent, and personal instructions.
- Create a Google Doc, Google Sheet, or PDF and store its URL with the mission.
- Preserve the text result and failure details when external file creation fails.

**Exit criterion:** An assigned employee can run a mission and open the resulting document from Orion; failures remain inspectable and retryable.

## Phase 4 — Knowledge, Operations, and Launch Readiness

Complete the reference experience and make it safe to operate.

- List supported Google Drive files and let admins attach selected files to agents.
- Extract readable context from Google Docs, Google Sheets, DOCX, PDF, TXT, and CSV files on the server.
- Finish the queued, in-progress, completed, and failed mission board.
- Record token usage, model, cost estimate, user, agent, and event type.
- Finish Usage and Settings screens, including avatar upload.
- Add audit-friendly logs, retry behavior, secret checks, accessibility checks, deployment documentation, and visual regression QA.

**Exit criterion:** The complete admin and employee workflows match the supplied screens, usage is traceable, supported knowledge files affect runs, and the production checklist passes.

## Core Data Model

- `profiles`: Supabase user profile and role
- `company_settings`: shared company and brand context
- `agents`: Orion configuration plus managed-agent identifier
- `user_agents`: employee assignment and personal instructions
- `agent_knowledge`: selected Drive file metadata per agent
- `integrations`: company-level external connection references
- `missions`: brief, status, run/session identifiers, output URL, fallback text, and errors
- `usage_events`: tokens, estimated cost, model, event type, user, agent, and mission references

## MVP Boundaries

- One company; no organization switching or multi-tenancy.
- Email/password authentication is sufficient.
- Google Drive connects once at company level.
- Missions are manually triggered; scheduling and recurring missions are deferred.
- One mission uses one agent and creates one output artifact.
- Text output is retained as a fallback, but collaborative editing happens in Google Drive.
- Billing, approval workflows, agent-to-agent orchestration, and mobile-native layouts are deferred.

## Quality Gate for Every Phase

- Lint and strict TypeScript checks pass.
- Automated tests cover new permissions and core domain behavior.
- Server-side authorization is verified for admin and employee roles.
- A browser smoke test covers the phase's exit criterion.
- No API keys, OAuth tokens, or provider secrets reach the browser bundle or logs.

