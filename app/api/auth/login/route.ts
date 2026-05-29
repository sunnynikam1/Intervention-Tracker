import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(120),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    await connectToDatabase();
    const user = await UserModel.findOne({ email: parsed.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const token = await signAuthToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login successful.",
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Please check your email and password." }, { status: 400 });
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

    return NextResponse.json({ message: "Invalid login request." }, { status: 400 });
  }
}
