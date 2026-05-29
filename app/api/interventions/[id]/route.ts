import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { interventionPatchSchema } from "@/lib/validators";
import { InterventionModel } from "@/models/Intervention";

type Params = {
  params: Promise<{ id: string }>;
};

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid intervention id." }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    const user = await verifyAuthToken(token);

    const payload = await request.json();
    const validated = interventionPatchSchema.parse(payload);

    await connectToDatabase();
    const existing = await InterventionModel.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Intervention not found." }, { status: 404 });
    }

    const canManage = user.role === "admin" || existing.ownerId === user.userId;
    if (!canManage) {
      return NextResponse.json({ message: "Forbidden: not your intervention." }, { status: 403 });
    }

    const updated = await InterventionModel.findByIdAndUpdate(id, validated, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ message: "Intervention not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid input.", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Unable to update record." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid intervention id." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  const user = await verifyAuthToken(token);

  await connectToDatabase();
  const existing = await InterventionModel.findById(id);

  if (!existing) {
    return NextResponse.json({ message: "Intervention not found." }, { status: 404 });
  }

  const canManage = user.role === "admin" || existing.ownerId === user.userId;
  if (!canManage) {
    return NextResponse.json({ message: "Forbidden: not your intervention." }, { status: 403 });
  }

  const deleted = await InterventionModel.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ message: "Intervention not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
