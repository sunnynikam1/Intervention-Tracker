import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(120),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const email = parsed.email.toLowerCase();

    await connectToDatabase();
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Email is already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const isAdmin = process.env.ADMIN_EMAIL?.toLowerCase() === email;
    const created = await UserModel.create({
      name: parsed.name,
      email,
      passwordHash,
      role: isAdmin ? "admin" : "mentor",
    });
    return NextResponse.json(
      {
        message: "Registration successful. Please login to continue.",
        user: { id: String(created._id), name: created.name, email: created.email, role: created.role },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Please check your name, email, and password." },
        { status: 400 },
      );
    }

    const detail = error instanceof Error ? error.message : "";
    if (detail.includes("Missing MONGODB_URI")) {
      return NextResponse.json(
        { message: "Database is not configured. Add MONGODB_URI to frontend/.env.local." },
        { status: 503 },
      );
    }

    if (
      detail.includes("whitelist") ||
      detail.includes("Could not connect") ||
      detail.includes("querySrv") ||
      detail.includes("ECONNREFUSED")
    ) {
      return NextResponse.json(
        {
          message:
            "Cannot connect to MongoDB. In Atlas, open Network Access and add your current IP (or 0.0.0.0/0 for local dev), wait a minute, then try again.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "Invalid registration request." }, { status: 400 });
  }
}
