import { NextRequest, NextResponse } from "next/server";
import { searchFoods } from "@/lib/usda";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    const results = await searchFoods(query);
    const foods = results.foods ?? [];

    // Transform and cache each food in the database
    const savedFoods = await Promise.all(
      foods.slice(0, 10).map(async (food: any) => {
        const nutrients = food.foodNutrients ?? [];

        const get = (name: string) =>
          nutrients.find((n: any) => n.nutrientName === name)?.value ?? 0;

        return prisma.food.upsert({
          where: { id: food.fdcId.toString() },
          update: {},
          create: {
            id: food.fdcId.toString(),
            name: food.description,
            brand: food.brandOwner ?? null,
            servingSize: food.servingSize ?? 100,
            servingUnit: food.servingSizeUnit ?? "g",
            calories: get("Energy"),
            protein: get("Protein"),
            carbs: get("Carbohydrate, by difference"),
            fat: get("Total lipid (fat)"),
            fiber: get("Fiber, total dietary"),
            sugar: get("Sugars, total including NLEA"),
            sodium: get("Sodium, Na"),
            isCustom: false,
          },
        });
      }),
    );

    return NextResponse.json({ foods: savedFoods });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 },
    );
  }
}
