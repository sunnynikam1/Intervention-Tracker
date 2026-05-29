import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ZodError } from "zod";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { interventionInputSchema } from "@/lib/validators";
import { InterventionModel } from "@/models/Intervention";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ message: "Please log in to view interventions." }, { status: 401 });
    }

    const user = await verifyAuthToken(token);
    const filter = user.role === "admin" ? {} : { ownerId: user.userId };

    await connectToDatabase();
    const interventions = await InterventionModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(interventions, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Unable to load interventions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ message: "Please log in to create interventions." }, { status: 401 });
    }
    const user = await verifyAuthToken(token);

    const payload = await request.json();
    const validated = interventionInputSchema.parse(payload);

    await connectToDatabase();
    await InterventionModel.updateMany(
      { $or: [{ ownerId: { $exists: false } }, { ownerId: null }] },
      { $set: { ownerId: user.userId } },
    );
    const created = await InterventionModel.create({
      ...validated,
      ownerId: user.userId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid input.", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Unable to create record." }, { status: 500 });
  }
}
