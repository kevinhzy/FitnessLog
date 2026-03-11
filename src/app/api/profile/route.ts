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

    return NextResponse.json({
        name: user.name,
        email: user.email,
        profile: user.profile,
    });
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { profile: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const {
        name,
        calorieGoal,
        proteinGoal,
        carbGoal,
        fatGoal,
        weight,
        height,
        dateOfBirth,
        activityLevel,
        weightUnit,
    } = await req.json();

    // Update user name
    if (name !== undefined) {
        await prisma.user.update({
            where: { id: user.id },
            data: { name },
        });
    }

    // Upsert profile — create if it doesn't exist, update if it does
    const profile = await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
            calorieGoal: calorieGoal ?? undefined,
            proteinGoal: proteinGoal ?? undefined,
            carbGoal: carbGoal ?? undefined,
            fatGoal: fatGoal ?? undefined,
            weight: weight ?? undefined,
            height: height ?? undefined,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            activityLevel: activityLevel ?? undefined,
            weightUnit: weightUnit ?? undefined,
        },
        create: {
            userId: user.id,
            calorieGoal: calorieGoal ?? null,
            proteinGoal: proteinGoal ?? null,
            carbGoal: carbGoal ?? null,
            fatGoal: fatGoal ?? null,
            weight: weight ?? null,
            height: height ?? null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            activityLevel: activityLevel ?? null,
            weightUnit: weightUnit ?? "kg",
        },
    });

    return NextResponse.json({ profile });
}