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

  const now = new Date();

  // Last 7 days date range
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Last 30 days date range
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch diary entries for last 7 days
  const diaryEntries = await prisma.diaryEntry.findMany({
    where: {
      userId: user.id,
      date: { gte: sevenDaysAgo },
    },
    include: { food: true },
    orderBy: { date: "asc" },
  });

  // Fetch workouts for last 30 days
  const workouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      date: { gte: thirtyDaysAgo },
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { where: { completed: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Build daily nutrition totals for the last 7 days
  const dailyNutrition: Record<
    string,
    {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  > = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyNutrition[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  for (const entry of diaryEntries) {
    if (!entry.food) continue;
    const key = entry.date.toISOString().split("T")[0];
    if (!dailyNutrition[key]) continue;
    dailyNutrition[key].calories += entry.food.calories * entry.amount;
    dailyNutrition[key].protein += entry.food.protein * entry.amount;
    dailyNutrition[key].carbs += entry.food.carbs * entry.amount;
    dailyNutrition[key].fat += entry.food.fat * entry.amount;
  }

  // Calculate weekly averages
  const days = Object.values(dailyNutrition);
  const loggedDays = days.filter((d) => d.calories > 0);
  const weeklyAverages =
    loggedDays.length > 0
      ? {
          calories:
            loggedDays.reduce((s, d) => s + d.calories, 0) / loggedDays.length,
          protein:
            loggedDays.reduce((s, d) => s + d.protein, 0) / loggedDays.length,
          carbs:
            loggedDays.reduce((s, d) => s + d.carbs, 0) / loggedDays.length,
          fat: loggedDays.reduce((s, d) => s + d.fat, 0) / loggedDays.length,
        }
      : null;

  // Workout stats
  const totalWorkouts = workouts.length;
  const workoutsThisWeek = workouts.filter(
    (w) => new Date(w.date) >= sevenDaysAgo,
  ).length;

  // Most trained muscle groups (last 30 days)
  const muscleCounts: Record<string, number> = {};
  for (const workout of workouts) {
    for (const we of workout.exercises) {
      const category = we.exercise.category;
      muscleCounts[category] = (muscleCounts[category] ?? 0) + 1;
    }
  }
  const topMuscles = Object.entries(muscleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Personal records — best weight lifted per exercise (last 30 days)
  const prMap: Record<string, { weight: number; reps: number }> = {};
  for (const workout of workouts) {
    for (const we of workout.exercises) {
      for (const set of we.sets) {
        if (!set.weight || !set.reps) continue;
        const name = we.exercise.name;
        if (!prMap[name] || set.weight > prMap[name].weight) {
          prMap[name] = { weight: set.weight, reps: set.reps };
        }
      }
    }
  }
  const personalRecords = Object.entries(prMap)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 5)
    .map(([name, record]) => ({ name, ...record }));

  return NextResponse.json({
    dailyNutrition: Object.entries(dailyNutrition).map(([date, totals]) => ({
      date,
      ...totals,
    })),
    weeklyAverages,
    goals: {
      calories: user.profile?.calorieGoal ?? null,
      protein: user.profile?.proteinGoal ?? null,
      carbs: user.profile?.carbGoal ?? null,
      fat: user.profile?.fatGoal ?? null,
    },
    workoutStats: {
      totalWorkouts,
      workoutsThisWeek,
    },
    topMuscles,
    personalRecords,
    recentWorkouts: workouts
      .slice(-3)
      .reverse()
      .map((w) => ({
        id: w.id,
        name: w.name,
        date: w.date,
        exerciseCount: w.exercises.length,
      })),
  });
}
