import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const date =
    req.nextUrl.searchParams.get("date") ??
    new Date().toISOString().split("T")[0];

  // Fetch diary entries for the day
  const diaryEntries = await prisma.diaryEntry.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lte: new Date(`${date}T23:59:59.999Z`),
      },
    },
    include: { food: true },
  });

  // Fetch workouts for the day
  const workouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lte: new Date(`${date}T23:59:59.999Z`),
      },
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  // Calculate nutrition totals
  const nutrition = diaryEntries.reduce(
    (acc, entry) => {
      if (!entry.food) return acc;
      return {
        calories: acc.calories + entry.food.calories * entry.amount,
        protein: acc.protein + entry.food.protein * entry.amount,
        carbs: acc.carbs + entry.food.carbs * entry.amount,
        fat: acc.fat + entry.food.fat * entry.amount,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return NextResponse.json({
    date,
    nutrition,
    workouts,
    goals: {
      calories: user.profile?.calorieGoal ?? null,
      protein: user.profile?.proteinGoal ?? null,
      carbs: user.profile?.carbGoal ?? null,
      fat: user.profile?.fatGoal ?? null,
    },
  });
}
