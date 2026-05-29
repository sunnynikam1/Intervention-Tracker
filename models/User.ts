import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["mentor", "admin"], default: "mentor", required: true },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema> & { _id: string };

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
