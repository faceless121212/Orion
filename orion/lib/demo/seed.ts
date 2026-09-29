import { estimateCostUsd } from "@/lib/agents/catalog";
import { orionCompanyContext } from "@/lib/demo/orion-context";
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
  copywriter: "10000000-0000-4000-8000-000000000001",
  researcher: "10000000-0000-4000-8000-000000000002",
  analyst: "10000000-0000-4000-8000-000000000003",
  events: "10000000-0000-4000-8000-000000000004",
  legacy: "10000000-0000-4000-8000-000000000005",
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
    { id: demoUserIds.admin, email: "alex@orion.demo", fullName: "Alex Morgan", role: "admin", jobTitle: "Head of Community", avatarUrl: "/brand/avatars/alex.webp" },
    { id: demoUserIds.priya, email: "priya@orion.demo", fullName: "Priya Shah", role: "user", jobTitle: "Community Marketing Manager", avatarUrl: "/brand/avatars/priya.webp" },
    { id: demoUserIds.diego, email: "diego@orion.demo", fullName: "Diego Alvarez", role: "user", jobTitle: "Partnerships Lead", avatarUrl: "/brand/avatars/diego.webp" },
    { id: demoUserIds.mei, email: "mei@orion.demo", fullName: "Mei Chen", role: "user", jobTitle: "Growth Analyst", avatarUrl: "/brand/avatars/mei.webp" },
  ];

  const company: CompanySettings = { ...orionCompanyContext };

  const agents: AgentRecord[] = [
    {
      id: agentIds.copywriter,
      name: "Community Copywriter",
      description: "Writes welcome posts, announcements, and member emails in the Orion voice.",
      model: "claude-opus-5",
      icon: "pen",
      status: "active",
      systemPrompt:
        "You're Orion's community copywriter. Write announcements, welcome posts, and member emails that help people feel welcomed, valued, and heard. Follow the Orion voice: friendly, encouraging, clear, and conversational, with benefit-first headlines and natural contractions. Offer two headline options, keep paragraphs short, and never sound corporate, salesy, or pushy.",
      updatedAt: at(12),
    },
    {
      id: agentIds.researcher,
      name: "Community Researcher",
      description: "Researches community trends and platforms, and summarizes what it finds with sources.",
      model: "claude-sonnet-5",
      icon: "search",
      status: "active",
      systemPrompt:
        "You're Orion's community researcher. Investigate the question in the brief, compare platforms and approaches fairly, and cite every source. Separate facts from interpretation, and finish with three practical recommendations for community builders. Keep it clear and encouraging.",
      updatedAt: at(20),
    },
    {
      id: agentIds.analyst,
      name: "Engagement Analyst",
      description: "Turns community data into engagement reports and explains the numbers in plain language.",
      model: "claude-opus-5",
      icon: "chart",
      status: "active",
      systemPrompt:
        "You're Orion's engagement analyst. Build well-structured spreadsheets with labeled assumptions, and add a short narrative that explains what's driving participation. Focus on opportunities: say \"here are a few ways to boost engagement\" rather than dwelling on what's missing.",
      updatedAt: at(8),
    },
    {
      id: agentIds.events,
      name: "Event Promoter",
      description: "Plans live events and writes the promotion that gets members to show up.",
      model: "claude-sonnet-5",
      icon: "megaphone",
      status: "active",
      systemPrompt:
        "You're Orion's event promoter. Plan live events that turn passive members into active contributors, and write invitations, reminders, and follow-ups in the Orion voice. Keep calls to action specific and friendly, and always explain why the event is worth members' time.",
      updatedAt: at(3),
    },
    {
      id: agentIds.legacy,
      name: "Legacy Help Bot",
      description: "Answered member support questions before the help center launched.",
      model: "claude-haiku-4-5",
      icon: "bot",
      status: "archived",
      systemPrompt: "You answer common Orion member questions briefly and warmly, and link to the help center when it helps.",
      updatedAt: at(45),
    },
  ];

  const assignments: DemoAssignment[] = [
    { userId: demoUserIds.admin, agentId: agentIds.copywriter, customInstructions: "", createdAt: at(30) },
    { userId: demoUserIds.admin, agentId: agentIds.researcher, customInstructions: "Focus on creator and education communities first.", createdAt: at(30) },
    { userId: demoUserIds.priya, agentId: agentIds.events, customInstructions: "Most of my events are for coaching communities, so use coaching examples.", createdAt: at(25) },
    { userId: demoUserIds.priya, agentId: agentIds.researcher, customInstructions: "", createdAt: at(25) },
    { userId: demoUserIds.priya, agentId: agentIds.legacy, customInstructions: "", createdAt: at(60) },
    { userId: demoUserIds.diego, agentId: agentIds.copywriter, customInstructions: "Partner-facing copy: mention the co-marketing program when it fits.", createdAt: at(22) },
    { userId: demoUserIds.mei, agentId: agentIds.analyst, customInstructions: "Report by month and call out the top three spaces by participation.", createdAt: at(18) },
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
    webSearch: agentId === agentIds.researcher,
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
    mission("20000000-0000-4000-8000-000000000001", demoUserIds.admin, agentIds.copywriter, "Welcome post for new members", "A warm welcome post for our community space: say hi, explain where to start, and invite people to introduce themselves. Keep it short and encouraging.", "completed", "google_doc", 2),
    mission("20000000-0000-4000-8000-000000000002", demoUserIds.admin, agentIds.researcher, "How creators run paid communities", "Research how creators structure paid memberships in 2026: pricing tiers, what members value most, and what drives renewals. Cite sources.", "completed", "pdf", 5),
    mission("20000000-0000-4000-8000-000000000003", demoUserIds.admin, agentIds.copywriter, "Launch announcement: AI event recaps", "Announce our new AI-powered event recaps. Lead with the benefit (members who missed an event can catch up in minutes), then how it works, then a friendly call to action.", "queued", "google_doc", 0),
    mission("20000000-0000-4000-8000-000000000004", demoUserIds.admin, agentIds.researcher, "Community moderation best practices", "Summarize current best practices for moderating fast-growing communities, with examples that fit creators and educators.", "failed", "pdf", 1, {
      error: "Google Drive rejected the upload: the shared folder is full (quota exceeded). The text result was kept below.",
      outputText: "Community moderation best practices: summary draft\n\n1. Publish clear, friendly community guidelines and pin them where new members start.\n2. Recruit volunteer moderators early and give them a private space to coordinate.\n3. Respond to issues quickly and privately first; celebrate positive behavior publicly.",
    }),
    mission("20000000-0000-4000-8000-000000000005", demoUserIds.priya, agentIds.events, "Spring coaching summit invite", "Invitation email for our spring coaching summit: three live sessions, a community Q&A, and small-group networking. Make it feel welcoming and worth the time.", "completed", "google_doc", 3),
    mission("20000000-0000-4000-8000-000000000006", demoUserIds.priya, agentIds.events, "Monthly AMA run-of-show", "Run-of-show and reminder messages for our monthly ask-me-anything with a guest coach. Include a follow-up post to keep the conversation going.", "queued", "google_doc", 0),
    mission("20000000-0000-4000-8000-000000000007", demoUserIds.priya, agentIds.researcher, "Event formats that boost participation", "Collect event formats that get members participating (not just watching) and rank them by effort and impact.", "completed", "google_sheet", 9),
    mission("20000000-0000-4000-8000-000000000008", demoUserIds.diego, agentIds.copywriter, "Partner welcome kit for Creator Collective", "A welcome kit for our new partner Creator Collective: what Orion helps them do, how to launch their community in the first 30 days, and who to contact.", "completed", "pdf", 4),
    mission("20000000-0000-4000-8000-000000000009", demoUserIds.mei, agentIds.analyst, "Q3 engagement report", "Build a Q3 engagement report: active members, posts, event attendance, and course completions by month, with a short narrative on what's working.", "completed", "google_sheet", 6),
    mission("20000000-0000-4000-8000-000000000010", demoUserIds.mei, agentIds.analyst, "Member retention forecast", "Forecast member retention for the next two quarters based on current engagement trends, and suggest three ways to boost it.", "queued", "google_sheet", 0),
  ];

  const users = [demoUserIds.admin, demoUserIds.priya, demoUserIds.diego, demoUserIds.mei];
  const userAgents: Record<string, string[]> = {
    [demoUserIds.admin]: [agentIds.copywriter, agentIds.researcher],
    [demoUserIds.priya]: [agentIds.events, agentIds.researcher],
    [demoUserIds.diego]: [agentIds.copywriter],
    [demoUserIds.mei]: [agentIds.analyst],
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
    { id: "drive-brand-guidelines", name: "Orion brand guidelines", kind: "doc", modifiedAt: at(10), sizeBytes: 86_000 },
    { id: "drive-community-playbook", name: "Community playbook 2026", kind: "doc", modifiedAt: at(40), sizeBytes: 140_000 },
    { id: "drive-case-creator-collective", name: "Case study: Creator Collective", kind: "pdf", modifiedAt: at(55), sizeBytes: 820_000 },
    { id: "drive-onboarding-emails", name: "Member onboarding email sequence", kind: "docx", modifiedAt: at(21), sizeBytes: 64_000 },
    { id: "drive-member-faq", name: "Member FAQ export", kind: "csv", modifiedAt: at(14), sizeBytes: 38_000 },
    { id: "drive-platform-notes", name: "Community platform notes", kind: "txt", modifiedAt: at(7), sizeBytes: 18_000 },
    { id: "drive-engagement-q3", name: "Member engagement Q3", kind: "sheet", modifiedAt: at(33), sizeBytes: 95_000 },
    { id: "drive-event-calendar", name: "Live event calendar", kind: "sheet", modifiedAt: at(5), sizeBytes: 42_000 },
  ];

  const knowledge: DemoKnowledge[] = [
    { agentId: agentIds.copywriter, fileId: "drive-brand-guidelines", attachedAt: at(12) },
    { agentId: agentIds.copywriter, fileId: "drive-onboarding-emails", attachedAt: at(12) },
    { agentId: agentIds.researcher, fileId: "drive-platform-notes", attachedAt: at(9) },
    { agentId: agentIds.events, fileId: "drive-event-calendar", attachedAt: at(3) },
    { agentId: agentIds.events, fileId: "drive-brand-guidelines", attachedAt: at(3) },
    { agentId: agentIds.analyst, fileId: "drive-engagement-q3", attachedAt: at(8) },
  ];

  return {
    profiles,
    company,
    agents,
    assignments,
    missions,
    usage,
    drive: { status: "connected", accountEmail: "workspace@orion.demo", connectedAt: at(35) },
    driveFiles,
    knowledge,
  };
}
