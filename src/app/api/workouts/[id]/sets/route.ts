import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params; // id not needed here but params must be awaited
  const { workoutExerciseId, reps, weight, rpe, notes } = await req.json();

  const existingCount = await prisma.exerciseSet.count({
    where: { workoutExerciseId },
  });

  const set = await prisma.exerciseSet.create({
    data: {
      workoutExerciseId,
      setNumber: existingCount + 1,
      reps: reps ?? null,
      weight: weight ?? null,
      rpe: rpe ?? null,
      notes: notes ?? null,
      completed: false,
    },
  });

  return NextResponse.json(set, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params; // id not needed here but params must be awaited
  const { setId, reps, weight, rpe, notes, completed } = await req.json();

  const set = await prisma.exerciseSet.update({
    where: { id: setId },
    data: {
      reps: reps ?? undefined,
      weight: weight ?? undefined,
      rpe: rpe ?? undefined,
      notes: notes ?? undefined,
      completed: completed ?? undefined,
    },
  });

  return NextResponse.json(set);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.exerciseSet.delete({ where: { id } });

  return NextResponse.json({ success: true });
}