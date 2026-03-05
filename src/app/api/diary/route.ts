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
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

  const entries = await prisma.diaryEntry.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lte: new Date(`${date}T23:59:59.999Z`),
      },
    },
    include: { food: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { foodId, mealType, amount, date } = await req.json();

  if (!foodId || !mealType || !amount || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entry = await prisma.diaryEntry.create({
    data: {
      userId: user.id,
      foodId,
      mealType,
      amount,
      date: new Date(date),
    },
    include: { food: true },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.diaryEntry.delete({ where: { id } });

  return NextResponse.json({ success: true });
}