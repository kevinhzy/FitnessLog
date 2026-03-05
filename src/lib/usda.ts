const BASE_URL = "https://api.nal.usda.gov/fdc/v1";
const API_KEY = process.env.USDA_API_KEY!;

export async function searchFoods(query: string, pageSize = 10) {
  const res = await fetch(
    `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${API_KEY}`
  );
  if (!res.ok) {
    const error = await res.json();
    console.error("USDA API error:", error);
    throw new Error("USDA API error");
  }
  return res.json();
}

export async function getFoodById(fdcId: string) {
  const res = await fetch(
    `${BASE_URL}/food/${fdcId}?api_key=${API_KEY}`
  );
  if (!res.ok) {
    const error = await res.json();
    console.error("USDA API error:", error);
    throw new Error("USDA API error");
  }
  return res.json();
}