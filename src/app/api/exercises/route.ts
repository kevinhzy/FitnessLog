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
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const query = req.nextUrl.searchParams.get("query") ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? undefined;

  const exercises = await prisma.exercise.findMany({
    where: {
      AND: [
        query ? { name: { contains: query, mode: "insensitive" } } : {},
        category ? { category } : {},
        {
          OR: [{ isCustom: false }, { createdBy: user.id }],
        },
      ],
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(exercises);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { name, category, equipment } = await req.json();

  if (!name || !category) {
    return NextResponse.json(
      { error: "Name and category are required" },
      { status: 400 },
    );
  }

  const exercise = await prisma.exercise.create({
    data: {
      name,
      category,
      equipment: equipment ?? null,
      isCustom: true,
      createdBy: user.id,
    },
  });

  return NextResponse.json(exercise, { status: 201 });
}
