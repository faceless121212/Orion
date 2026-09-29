import { estimateCostUsd } from "@/lib/agents/catalog";
import type {
  AgentRecord,
  CompanySettings,
  DriveConnection,
  DriveFile,
  Mission,
  Profile,
  UsageEvent,
} from "@/lib/domain/types";

export type DemoAssignment = {
  userId: string;
  agentId: string;
  customInstructions: string;
  createdAt: string;
};

export type DemoKnowledge = { agentId: string; fileId: string; attachedAt: string };

export type DemoMission = Omit<Mission, "agentName" | "agentIcon">;

export type DemoUsageEvent = Omit<UsageEvent, "userName" | "agentName">;

export type DemoState = {
  profiles: Profile[];
  company: CompanySettings;
  agents: AgentRecord[];
  assignments: DemoAssignment[];
  missions: DemoMission[];
  usage: DemoUsageEvent[];
  drive: DriveConnection;
  driveFiles: DriveFile[];
  knowledge: DemoKnowledge[];
};

export const demoUserIds = {
  admin: "00000000-0000-4000-8000-000000000001",
  priya: "00000000-0000-4000-8000-000000000002",
  diego: "00000000-0000-4000-8000-000000000003",
  mei: "00000000-0000-4000-8000-000000000004",
} as const;

const agentIds = {
  proposal: "10000000-0000-4000-8000-000000000001",
  research: "10000000-0000-4000-8000-000000000002",
  finance: "10000000-0000-4000-8000-000000000003",
  copy: "10000000-0000-4000-8000-000000000004",
  faq: "10000000-0000-4000-8000-000000000005",
} as const;

const DAY = 24 * 60 * 60 * 1000;

/** Deterministic PRNG so every restart seeds the same numbers. */
function prng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function createSeed(now = Date.now()): DemoState {
  const at = (daysAgo: number, hours = 0) => new Date(now - daysAgo * DAY - hours * 3_600_000).toISOString();
  const random = prng(42);

  const profiles: Profile[] = [
    { id: demoUserIds.admin, email: "alex@northwind.demo", fullName: "Alex Morgan", role: "admin", jobTitle: "Head of Operations", avatarUrl: null },
    { id: demoUserIds.priya, email: "priya@northwind.demo", fullName: "Priya Shah", role: "user", jobTitle: "Marketing Manager", avatarUrl: null },
    { id: demoUserIds.diego, email: "diego@northwind.demo", fullName: "Diego Alvarez", role: "user", jobTitle: "Sales Lead", avatarUrl: null },
    { id: demoUserIds.mei, email: "mei@northwind.demo", fullName: "Mei Chen", role: "user", jobTitle: "Finance Analyst", avatarUrl: null },
  ];

  const company: CompanySettings = {
    companyName: "Northwind Clinics",
    overview:
      "Northwind Clinics builds scheduling and patient-intake software for independent physiotherapy and dental clinics. Our flagship product, Northwind Desk, replaces paper intake forms and phone booking.",
    audience: "Clinic owners and office managers at practices with 2–25 staff in the US and Canada.",
    brandVoice: "Warm, plain-spoken, and confident. We sound like a helpful colleague, never a salesperson.",
    writingGuidelines:
      "Use American English. Say “clinic”, not “practice”. Keep paragraphs under four sentences. Never promise specific ROI numbers.",
  };

  const agents: AgentRecord[] = [
    {
      id: agentIds.proposal,
      name: "Proposal Writer",
      description: "Drafts client proposals from a short brief using our pricing tiers and case studies.",
      model: "claude-opus-5",
      icon: "pen",
      status: "active",
      systemPrompt:
        "You are Northwind Clinics' proposal writer. Turn a sales brief into a clear, persuasive proposal for a clinic owner: summary, the clinic's current pain, how Northwind Desk solves it, rollout plan, and pricing. Use the attached pricing sheet and case studies; never invent prices or results.",
      updatedAt: at(12),
    },
    {
      id: agentIds.research,
      name: "Market Researcher",
      description: "Researches competitors and market trends and summarizes findings with sources.",
      model: "claude-sonnet-5",
      icon: "search",
      status: "active",
      systemPrompt:
        "You are Northwind's market researcher. Investigate the question in the brief, compare competitors fairly, and cite every source. Separate facts from interpretation and finish with three recommendations.",
      updatedAt: at(20),
    },
    {
      id: agentIds.finance,
      name: "Finance Analyst",
      description: "Builds budget and forecast sheets and explains the numbers in plain language.",
      model: "claude-opus-5",
      icon: "chart",
      status: "active",
      systemPrompt:
        "You are Northwind's finance analyst. Produce well-structured spreadsheets with labeled assumptions, formulas described in words, and a short narrative explaining the drivers and risks.",
      updatedAt: at(8),
    },
    {
      id: agentIds.copy,
      name: "Brand Copywriter",
      description: "Writes landing pages, emails, and social posts in the Northwind voice.",
      model: "claude-sonnet-5",
      icon: "megaphone",
      status: "active",
      systemPrompt:
        "You are Northwind's brand copywriter. Write in a warm, plain-spoken voice for clinic owners. Offer two variants for every headline and keep calls to action specific.",
      updatedAt: at(3),
    },
    {
      id: agentIds.faq,
      name: "Legacy FAQ Bot",
      description: "Answered support questions before the help center launched.",
      model: "claude-haiku-4-5",
      icon: "bot",
      status: "archived",
      systemPrompt: "You answer common Northwind Desk support questions briefly and link to the help center.",
      updatedAt: at(45),
    },
  ];

  const assignments: DemoAssignment[] = [
    { userId: demoUserIds.admin, agentId: agentIds.proposal, customInstructions: "", createdAt: at(30) },
    { userId: demoUserIds.admin, agentId: agentIds.research, customInstructions: "Focus on the Canadian market first.", createdAt: at(30) },
    { userId: demoUserIds.priya, agentId: agentIds.copy, customInstructions: "I run campaigns for dental clinics — use dental examples.", createdAt: at(25) },
    { userId: demoUserIds.priya, agentId: agentIds.research, customInstructions: "", createdAt: at(25) },
    { userId: demoUserIds.priya, agentId: agentIds.faq, customInstructions: "", createdAt: at(60) },
    { userId: demoUserIds.diego, agentId: agentIds.proposal, customInstructions: "Always include the 90-day onboarding offer.", createdAt: at(22) },
    { userId: demoUserIds.mei, agentId: agentIds.finance, customInstructions: "Use CAD and fiscal quarters starting in April.", createdAt: at(18) },
  ];

  const mission = (
    id: string,
    userId: string,
    agentId: string,
    title: string,
    brief: string,
    status: DemoMission["status"],
    outputFormat: DemoMission["outputFormat"],
    daysAgo: number,
    extra: Partial<DemoMission> = {},
  ): DemoMission => ({
    id,
    userId,
    agentId,
    title,
    brief,
    webSearch: agentId === agentIds.research,
    outputFormat,
    status,
    outputUrl: status === "completed" ? `/missions/${id}/output` : null,
    outputText: null,
    error: null,
    createdAt: at(daysAgo, 2),
    updatedAt: at(daysAgo),
    startedAt: status === "queued" ? null : at(daysAgo, 1),
    completedAt: status === "completed" || status === "failed" ? at(daysAgo) : null,
    ...extra,
  });

  const missions: DemoMission[] = [
    mission("20000000-0000-4000-8000-000000000001", demoUserIds.admin, agentIds.proposal, "Proposal for Lakeside Physio", "Three-location physio group in Toronto, currently on paper intake. Wants online booking before January. Budget-conscious; emphasize the 90-day onboarding.", "completed", "google_doc", 2),
    mission("20000000-0000-4000-8000-000000000002", demoUserIds.admin, agentIds.research, "Competitor scan: Jane App vs. Cliniko", "Compare pricing, intake features, and Canadian data residency for Jane App and Cliniko. Who are we losing deals to and why?", "completed", "pdf", 5),
    mission("20000000-0000-4000-8000-000000000003", demoUserIds.admin, agentIds.proposal, "Renewal pitch for Bright Smile Dental", "Existing customer, 2 years in. Pitch the new reminders add-on. Mention their no-show rate dropped after launch (don't quote a number).", "queued", "google_doc", 0),
    mission("20000000-0000-4000-8000-000000000004", demoUserIds.admin, agentIds.research, "US telehealth regulation summary", "Summarize 2026 telehealth rule changes relevant to physiotherapy clinics in the US.", "failed", "pdf", 1, {
      error: "Google Drive rejected the upload: the shared folder is full (quota exceeded). The text result was kept below.",
      outputText: "US telehealth rules for physiotherapy — summary draft\n\n1. Medicare telehealth flexibilities for PT were extended through 2026.\n2. Several states now require in-person evaluation before remote follow-ups.\n3. Documentation must record the patient's location for each session.",
    }),
    mission("20000000-0000-4000-8000-000000000005", demoUserIds.priya, agentIds.copy, "Spring campaign landing page", "Landing page for dental clinics: 'Fill every chair this spring'. Hero, three benefits, testimonial slot, CTA to book a demo.", "completed", "google_doc", 3),
    mission("20000000-0000-4000-8000-000000000006", demoUserIds.priya, agentIds.copy, "Newsletter: October product update", "Monthly newsletter covering the reminders add-on, the new intake templates, and a customer spotlight.", "queued", "google_doc", 0),
    mission("20000000-0000-4000-8000-000000000007", demoUserIds.priya, agentIds.research, "Dental SaaS pricing benchmarks", "Collect published pricing for 6 dental practice software tools and summarize tiers.", "completed", "google_sheet", 9),
    mission("20000000-0000-4000-8000-000000000008", demoUserIds.diego, agentIds.proposal, "Proposal for Harbor Chiropractic", "Single-location chiro clinic, owner is tech-savvy, currently on a competitor. Focus on migration support.", "completed", "pdf", 4),
    mission("20000000-0000-4000-8000-000000000009", demoUserIds.mei, agentIds.finance, "Q3 budget vs. actuals", "Build a budget vs. actuals sheet for Q3 with variance commentary for marketing, sales, and support.", "completed", "google_sheet", 6),
    mission("20000000-0000-4000-8000-000000000010", demoUserIds.mei, agentIds.finance, "FY27 hiring plan forecast", "Forecast payroll for 6 planned hires across FY27 with benefits loading at 22%.", "queued", "google_sheet", 0),
  ];

  const users = [demoUserIds.admin, demoUserIds.priya, demoUserIds.diego, demoUserIds.mei];
  const userAgents: Record<string, string[]> = {
    [demoUserIds.admin]: [agentIds.proposal, agentIds.research],
    [demoUserIds.priya]: [agentIds.copy, agentIds.research],
    [demoUserIds.diego]: [agentIds.proposal],
    [demoUserIds.mei]: [agentIds.finance],
  };
  const modelOf = (agentId: string) => agents.find((agent) => agent.id === agentId)!.model;

  const usage: DemoUsageEvent[] = [];
  for (let index = 0; index < 48; index += 1) {
    const userId = users[Math.floor(random() * users.length)];
    const options = userAgents[userId];
    const agentId = options[Math.floor(random() * options.length)];
    const isPrompt = random() < 0.15;
    const model = isPrompt ? "claude-opus-5" : modelOf(agentId);
    const inputTokens = Math.round((isPrompt ? 900 : 6000) + random() * (isPrompt ? 600 : 14000));
    const outputTokens = Math.round((isPrompt ? 500 : 2500) + random() * (isPrompt ? 400 : 6000));
    usage.push({
      id: `30000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      userId: isPrompt ? demoUserIds.admin : userId,
      agentId: isPrompt ? null : agentId,
      missionId: null,
      eventType: isPrompt ? "prompt_generation" : "mission_run",
      model,
      inputTokens,
      outputTokens,
      costUsd: estimateCostUsd(model, inputTokens, outputTokens),
      createdAt: at(Math.floor(random() * 29), Math.floor(random() * 20)),
    });
  }

  const driveFiles: DriveFile[] = [
    { id: "drive-pricing-2026", name: "Northwind pricing tiers 2026", kind: "sheet", modifiedAt: at(10), sizeBytes: 48_000 },
    { id: "drive-case-lakeside", name: "Case study — Maple Grove Physio", kind: "doc", modifiedAt: at(40), sizeBytes: 120_000 },
    { id: "drive-case-dental", name: "Case study — Bright Smile Dental", kind: "pdf", modifiedAt: at(55), sizeBytes: 820_000 },
    { id: "drive-brand-guide", name: "Brand voice guide", kind: "docx", modifiedAt: at(90), sizeBytes: 260_000 },
    { id: "drive-faq", name: "Support FAQ export", kind: "csv", modifiedAt: at(14), sizeBytes: 64_000 },
    { id: "drive-competitors", name: "Competitor notes", kind: "txt", modifiedAt: at(7), sizeBytes: 18_000 },
    { id: "drive-budget-fy26", name: "FY26 budget", kind: "sheet", modifiedAt: at(33), sizeBytes: 95_000 },
    { id: "drive-onboarding", name: "90-day onboarding plan", kind: "doc", modifiedAt: at(21), sizeBytes: 74_000 },
  ];

  const knowledge: DemoKnowledge[] = [
    { agentId: agentIds.proposal, fileId: "drive-pricing-2026", attachedAt: at(12) },
    { agentId: agentIds.proposal, fileId: "drive-case-lakeside", attachedAt: at(12) },
    { agentId: agentIds.proposal, fileId: "drive-onboarding", attachedAt: at(9) },
    { agentId: agentIds.copy, fileId: "drive-brand-guide", attachedAt: at(3) },
    { agentId: agentIds.finance, fileId: "drive-budget-fy26", attachedAt: at(8) },
  ];

  return {
    profiles,
    company,
    agents,
    assignments,
    missions,
    usage,
    drive: { status: "connected", accountEmail: "workspace@northwind.demo", connectedAt: at(35) },
    driveFiles,
    knowledge,
  };
}
