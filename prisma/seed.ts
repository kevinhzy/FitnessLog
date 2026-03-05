import { PrismaClient } from "@prisma/client";
import exercises from "./exercises.json";

const prisma = new PrismaClient();

// Normalize equipment values from the dataset to match our schema
function normalizeEquipment(equipment: string | null): string | null {
  if (!equipment) return null;
  const map: Record<string, string | null> = {
    "body only": "bodyweight",
    "machine": "machine",
    "other": null,
    "foam roll": null,
    "dumbbell": "dumbbell",
    "cable": "machine",
    "barbell": "barbell",
    "bands": "bodyweight",
    "kettlebells": "dumbbell",
    "medicine ball": null,
    "exercise ball": null,
    "e-z curl bar": "barbell",
  };
  return map[equipment.toLowerCase()] ?? null;
}

async function main() {
  console.log(`Seeding ${exercises.length} exercises...`);

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: {
        name: exercise.name,
        category: exercise.category,
        equipment: normalizeEquipment(exercise.equipment),
        isCustom: false,
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());