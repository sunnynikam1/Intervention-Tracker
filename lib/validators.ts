import { z } from "zod";

const priorityValues = ["low", "medium", "high"] as const;
const statusValues = ["planned", "in_progress", "resolved"] as const;

export const interventionInputSchema = z.object({
  learnerName: z.string().trim().min(2).max(80),
  cohort: z.string().trim().min(2).max(40),
  challenge: z.string().trim().min(10).max(400),
  interventionPlan: z.string().trim().min(10).max(500),
  priority: z.enum(priorityValues),
  status: z.enum(statusValues).default("planned"),
  nextReviewDate: z.string().date(),
});

export const interventionPatchSchema = interventionInputSchema.partial();

export type InterventionInput = z.infer<typeof interventionInputSchema>;
