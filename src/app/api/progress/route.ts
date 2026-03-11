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
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const range = req.nextUrl.searchParams.get("range") ?? "30";
    const days = parseInt(range);

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Fetch all completed sets grouped by exercise
    const workouts = await prisma.workout.findMany({
        where: {
            userId: user.id,
            date: { gte: since },
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

    // Build exercise progress data — best weight per day per exercise
    const exerciseProgress: Record<string, { date: string; weight: number; reps: number }[]> = {};

    for (const workout of workouts) {
        const date = workout.date.toISOString().split("T")[0];
        for (const we of workout.exercises) {
            const name = we.exercise.name;
            for (const set of we.sets) {
                if (!set.weight || !set.reps) continue;
                if (!exerciseProgress[name]) exerciseProgress[name] = [];
                // Only keep the best set per day per exercise
                const existing = exerciseProgress[name].find((e) => e.date === date);
                if (!existing) {
                    exerciseProgress[name].push({ date, weight: set.weight, reps: set.reps });
                } else if (set.weight > existing.weight) {
                    existing.weight = set.weight;
                    existing.reps = set.reps;
                }
            }
        }
    }

    // Fetch weight entries
    const weightEntries = await prisma.profile.findUnique({
        where: { userId: user.id },
    });

    // Workout frequency — count workouts per week
    const weeklyFrequency: Record<string, number> = {};
    for (const workout of workouts) {
        const date = new Date(workout.date);
        // Get the Monday of the week
        const day = date.getDay();
        const monday = new Date(date);
        monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
        const key = monday.toISOString().split("T")[0];
        weeklyFrequency[key] = (weeklyFrequency[key] ?? 0) + 1;
    }

    const weeklyData = Object.entries(weeklyFrequency)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, count]) => ({ week, count }));

    // Get list of exercises the user has logged
    const trackedExercises = Object.keys(exerciseProgress);

    return NextResponse.json({
        exerciseProgress,
        trackedExercises,
        weeklyData,
        weightUnit: user.profile?.weightUnit ?? "kg",
    });
}