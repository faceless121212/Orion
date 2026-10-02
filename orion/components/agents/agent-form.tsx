"use client";

import { useActionState, useState, useTransition } from "react";
import { LoaderCircle, Save, WandSparkles } from "lucide-react";

import {
  generateAgentPromptAction,
  saveAgentAction,
} from "@/app/(dashboard)/(admin)/agents/actions";
import { AgentIcon } from "@/components/agents/agent-icon";
import { FieldError } from "@/components/auth/field-error";
import { FormField } from "@/components/forms/form-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  agentIcons,
  agentModels,
  defaultAgentModel,
  type AgentIcon as AgentIconName,
  type AgentStatus,
} from "@/lib/agents/catalog";
import { initialFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

export type AgentFormValues = {
  id?: string;
  name: string;
  description: string;
  model: string;
  icon: AgentIconName;
  status: AgentStatus;
  systemPrompt: string;
};

const emptyAgent: AgentFormValues = {
  name: "",
  description: "",
  model: defaultAgentModel,
  icon: "bot",
  status: "active",
  systemPrompt: "",
};

export function AgentForm({
  agent = emptyAgent,
  hasCompanyContext,
  created = false,
}: {
  agent?: AgentFormValues;
  hasCompanyContext: boolean;
  created?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveAgentAction,
    created ? { status: "success" as const, message: "Agent created." } : initialFormState,
  );
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);
  const [model, setModel] = useState(agent.model);
  const [status, setStatus] = useState<AgentStatus>(agent.status);
  const [icon, setIcon] = useState<AgentIconName>(agent.icon);
  const [generationError, setGenerationError] = useState<string>();
  const [generating, startGenerating] = useTransition();

  function generatePrompt() {
    setGenerationError(undefined);
    startGenerating(async () => {
      const result = await generateAgentPromptAction({ name, description });

      if (result.status === "success") {
        setSystemPrompt(result.prompt);
      } else {
        setGenerationError(result.message);
      }
    });
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      {agent.id ? <input name="agentId" type="hidden" value={agent.id} /> : null}
      <input name="icon" type="hidden" value={icon} />

      <div className="lg:col-span-2">
        <FormMessage state={state} />
      </div>

      <Card className="h-fit shadow-none">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How employees recognize this agent.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <FormField errors={state.errors?.name} id="name" label="Name">
            <Input
              aria-invalid={Boolean(state.errors?.name)}
              id="name"
              maxLength={80}
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Community Copywriter"
              required
              value={name}
            />
          </FormField>
          <FormField
            description="Explain the job this agent does. Also used to generate the system prompt."
            errors={state.errors?.description}
            id="description"
            label="Description"
          >
            <Textarea
              aria-invalid={Boolean(state.errors?.description)}
              id="description"
              maxLength={500}
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Writes welcome posts, announcements, and member emails in our voice."
              value={description}
            />
          </FormField>
          <FormField errors={state.errors?.model} id="model" label="Model">
            <NativeSelect id="model" name="model" onChange={(event) => setModel(event.target.value)} value={model}>
              {agentModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label} — {model.description}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Icon</legend>
            <div className="grid grid-cols-6 gap-2">
              {agentIcons.map((option) => {
                const selected = option === icon;

                return (
                  <button
                    aria-label={`Use ${option} icon`}
                    aria-pressed={selected}
                    className={cn(
                      "grid aspect-square place-items-center overflow-hidden rounded-xl border-2 border-transparent opacity-80 transition hover:opacity-100",
                      selected && "border-blue-500 opacity-100 ring-2 ring-blue-100",
                    )}
                    key={option}
                    onClick={() => setIcon(option)}
                    type="button"
                  >
                    <AgentIcon className="size-full rounded-[10px] ring-0" icon={option} />
                  </button>
                );
              })}
            </div>
            <FieldError messages={state.errors?.icon} />
          </fieldset>
          <FormField
            description="Archived agents disappear from every employee's squad but keep their assignments."
            errors={state.errors?.status}
            id="status"
            label="Status"
          >
            <NativeSelect
              id="status"
              name="status"
              onChange={(event) => setStatus(event.target.value as AgentStatus)}
              value={status}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </NativeSelect>
          </FormField>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>System prompt</CardTitle>
            <CardDescription className="mt-1.5">
              The standing instructions this agent follows on every mission.
            </CardDescription>
          </div>
          <Button disabled={generating} onClick={generatePrompt} type="button" variant="outline">
            {generating ? <LoaderCircle className="animate-spin" /> : <WandSparkles />}
            {generating ? "Generating…" : "Generate with AI"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {!hasCompanyContext ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Add company context first for prompts grounded in your brand and audience.
            </p>
          ) : null}
          {generationError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {generationError}
            </p>
          ) : null}
          <FormField errors={state.errors?.systemPrompt} id="systemPrompt" label="Prompt">
            <Textarea
              aria-invalid={Boolean(state.errors?.systemPrompt)}
              className="min-h-96 font-mono text-xs leading-5 md:text-xs"
              disabled={generating}
              id="systemPrompt"
              maxLength={20000}
              name="systemPrompt"
              onChange={(event) => setSystemPrompt(event.target.value)}
              placeholder="You're our community copywriter…"
              required
              value={systemPrompt}
            />
          </FormField>
          <p className="text-right text-xs text-muted-foreground">
            {systemPrompt.length.toLocaleString()} / 20,000
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={pending || generating} type="submit">
            <Save />
            {pending ? "Saving…" : agent.id ? "Save changes" : "Create agent"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
