import { z } from "zod";

import { uuidSchema } from "@/lib/agents/validation";
import { outputFormats } from "@/lib/domain/types";

export const missionSchema = z.object({
  agentId: z.string().min(1, "Choose an agent.").pipe(uuidSchema),
  title: z
    .string()
    .trim()
    .min(3, "Give the mission a title of at least 3 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  brief: z
    .string()
    .trim()
    .min(20, "Describe the mission in at least 20 characters.")
    .max(8000, "Brief must be 8,000 characters or fewer."),
  // Checkboxes submit "on" when checked and nothing otherwise.
  webSearch: z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean()),
  outputFormat: z.enum(outputFormats, "Choose an output format."),
});

export type MissionInput = z.infer<typeof missionSchema>;
