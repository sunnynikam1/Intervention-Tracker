import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { InterventionModel } from "@/models/Intervention";
import { redirect } from "next/navigation";

import InterventionsClient from "./interventions-client";

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  let initialItems: {
    _id: string;
    ownerId?: string;
    learnerName: string;
    cohort: string;
    challenge: string;
    interventionPlan: string;
    priority: "low" | "medium" | "high";
    status: "planned" | "in_progress" | "resolved";
    nextReviewDate: string;
  }[] = [];

  try {
    await connectToDatabase();
    const filter = currentUser.role === "admin" ? {} : { ownerId: currentUser.userId };
    const rows = await InterventionModel.find(filter).sort({ updatedAt: -1 }).lean();
    initialItems = rows.map((row) => ({
      _id: String(row._id),
      ownerId: row.ownerId ? String(row.ownerId) : undefined,
      learnerName: row.learnerName,
      cohort: row.cohort,
      challenge: row.challenge,
      interventionPlan: row.interventionPlan,
      priority: row.priority,
      status: row.status,
      nextReviewDate: row.nextReviewDate,
    }));
  } catch {
    initialItems = [];
  }

  return <InterventionsClient initialItems={initialItems} currentUser={currentUser} />;
}
