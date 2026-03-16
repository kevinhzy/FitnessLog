"use client";

import { useState, useEffect } from "react";
import { DiarySkeleton } from "@/components/Skeleton";

type Food = {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
};

type DiaryEntry = {
  id: string;
  mealType: string;
  amount: number;
  food: Food;
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function DiaryPage() {
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [date]);

  async function fetchEntries() {
    setLoading(true);
    const res = await fetch(`/api/diary?date=${date}`);
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }

  async function searchFoods() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const res = await fetch(
      `/api/foods?query=${encodeURIComponent(searchQuery)}`,
    );
    const data = await res.json();
    setSearchResults(data.foods ?? []);
    setSearching(false);
  }

  async function addEntry(food: Food) {
    if (!activeMeal) return;
    await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodId: food.id,
        mealType: activeMeal,
        amount: 1,
        date,
      }),
    });
    setSearchQuery("");
    setSearchResults([]);
    setActiveMeal(null);
    fetchEntries();
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/diary?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.food.calories * entry.amount,
      protein: acc.protein + entry.food.protein * entry.amount,
      carbs: acc.carbs + entry.food.carbs * entry.amount,
      fat: acc.fat + entry.food.fat * entry.amount,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Food Diary</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Macro Summary */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-4 gap-4 text-center">
        {[
          {
            label: "Calories",
            value: totals.calories.toFixed(0),
            unit: "kcal",
          },
          { label: "Protein", value: totals.protein.toFixed(1), unit: "g" },
          { label: "Carbs", value: totals.carbs.toFixed(1), unit: "g" },
          { label: "Fat", value: totals.fat.toFixed(1), unit: "g" },
        ].map((macro) => (
          <div key={macro.label}>
            <p className="text-xs text-gray-500">{macro.label}</p>
            <p className="text-lg font-bold">{macro.value}</p>
            <p className="text-xs text-gray-400">{macro.unit}</p>
          </div>
        ))}
      </div>

      {/* Meal Sections */}
      {loading ? (
        <DiarySkeleton />
      ) : (
        MEAL_TYPES.map((meal) => (
          <div key={meal} className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold capitalize">{meal}</h2>
              <button
                onClick={() => setActiveMeal(activeMeal === meal ? null : meal)}
                className="text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800"
              >
                + Add Food
              </button>
            </div>

            {/* Food entries for this meal */}
            {entries
              .filter((e) => e.mealType === meal)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2 border-t text-sm"
                >
                  <div>
                    <p className="font-medium">{entry.food.name}</p>
                    <p className="text-gray-400 text-xs">
                      {entry.food.servingSize * entry.amount}
                      {entry.food.servingUnit} ·{" "}
                      {(entry.food.calories * entry.amount).toFixed(0)} kcal
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}

            {/* Search box for this meal */}
            {activeMeal === meal && (
              <div className="mt-3 border-t pt-3">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchFoods()}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={searchFoods}
                    disabled={searching}
                    className="bg-black text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    {searching ? "..." : "Search"}
                  </button>
                </div>
                {searchResults.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between py-2 border-t text-sm"
                  >
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-gray-400 text-xs">
                        {food.servingSize}
                        {food.servingUnit} · {food.calories.toFixed(0)} kcal
                      </p>
                    </div>
                    <button
                      onClick={() => addEntry(food)}
                      className="text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
