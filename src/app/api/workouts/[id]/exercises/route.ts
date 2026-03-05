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

  const { id } = await params;
  const { exerciseId } = await req.json();

  const existingCount = await prisma.workoutExercise.count({
    where: { workoutId: id },
  });

  const workoutExercise = await prisma.workoutExercise.create({
    data: {
      workoutId: id,
      exerciseId,
      order: existingCount + 1,
    },
    include: {
      exercise: true,
      sets: true,
    },
  });

  return NextResponse.json(workoutExercise, { status: 201 });
}