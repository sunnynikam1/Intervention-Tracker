import mongoose, { Schema, type InferSchemaType } from "mongoose";

const interventionSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    learnerName: { type: String, required: true, trim: true, maxlength: 80 },
    cohort: { type: String, required: true, trim: true, maxlength: 40 },
    challenge: { type: String, required: true, trim: true, maxlength: 400 },
    interventionPlan: { type: String, required: true, trim: true, maxlength: 500 },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["planned", "in_progress", "resolved"],
      default: "planned",
      required: true,
    },
    nextReviewDate: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

interventionSchema.index({ status: 1, updatedAt: -1 });
interventionSchema.index({ cohort: 1, priority: 1 });

export type Intervention = InferSchemaType<typeof interventionSchema> & { _id: string };

const existingModel = mongoose.models.Intervention;

if (existingModel && !existingModel.schema.path("ownerId")) {
  delete mongoose.models.Intervention;
}

export const InterventionModel =
  mongoose.models.Intervention || mongoose.model("Intervention", interventionSchema);
