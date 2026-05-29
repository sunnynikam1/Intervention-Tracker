import { describe, expect, it } from "vitest";

import { interventionInputSchema } from "@/lib/validators";

describe("interventionInputSchema", () => {
  it("accepts valid payload", () => {
    const payload = {
      learnerName: "Aditi Sharma",
      cohort: "Jan-2026",
      challenge: "Learner is missing core assignments and needs structured support.",
      interventionPlan: "Schedule weekly mentor check-ins and assign revision modules.",
      priority: "high",
      status: "in_progress",
      nextReviewDate: "2026-06-15",
    };

    const result = interventionInputSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects invalid short fields", () => {
    const payload = {
      learnerName: "A",
      cohort: "J",
      challenge: "short",
      interventionPlan: "short",
      priority: "medium",
      status: "planned",
      nextReviewDate: "2026-06-15",
    };

    const result = interventionInputSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
