"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Goals = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

type ExerciseSet = {
  id: string;
  reps: number | null;
  weight: number | null;
  completed: boolean;
};

type WorkoutExercise = {
  id: string;
  exercise: { name: string; category: string };
  sets: ExerciseSet[];
};

type Workout = {
  id: string;
  name: string | null;
  exercises: WorkoutExercise[];
};

type SummaryData = {
  date: string;
  nutrition: NutritionTotals;
  goals: Goals;
  workouts: Workout[];
};

export default function SummaryPage() {
  const router = useRouter();
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [date]);

  async function fetchSummary() {
    setLoading(true);
    const res = await fetch(`/api/summary?date=${date}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  function progressPercentage(value: number, goal: number | null): number {
    if (!goal) return 0;
    return Math.min((value / goal) * 100, 100);
  }

  function progressColor(value: number, goal: number | null): string {
    if (!goal) return "bg-black";
    const pct = (value / goal) * 100;
    if (pct >= 100) return "bg-green-500";
    if (pct >= 75) return "bg-blue-500";
    return "bg-black";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Today's Summary</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : !data ? (
        <p className="text-center text-gray-400">Failed to load data.</p>
      ) : (
        <>
          {/* Nutrition Summary */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Nutrition</h2>
              <button
                onClick={() => router.push("/diary")}
                className="text-xs text-gray-400 hover:text-black"
              >
                View Diary →
              </button>
            </div>

            {/* Calorie summary */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Calories</span>
                <span className="text-gray-500">
                  {data.nutrition.calories.toFixed(0)}
                  {data.goals.calories
                    ? ` / ${data.goals.calories} kcal`
                    : " kcal"}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${progressColor(data.nutrition.calories, data.goals.calories)}`}
                  style={{
                    width: `${progressPercentage(data.nutrition.calories, data.goals.calories)}%`,
                  }}
                />
              </div>
            </div>

            {/* Macro grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Protein",
                  value: data.nutrition.protein,
                  goal: data.goals.protein,
                },
                {
                  label: "Carbs",
                  value: data.nutrition.carbs,
                  goal: data.goals.carbs,
                },
                {
                  label: "Fat",
                  value: data.nutrition.fat,
                  goal: data.goals.fat,
                },
              ].map((macro) => (
                <div key={macro.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{macro.label}</span>
                    <span>{macro.value.toFixed(1)}g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${progressColor(macro.value, macro.goal)}`}
                      style={{
                        width: `${progressPercentage(macro.value, macro.goal)}%`,
                      }}
                    />
                  </div>
                  {macro.goal && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Goal: {macro.goal}g
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* No goals set message */}
            {!data.goals.calories && (
              <p className="text-xs text-gray-400 mt-3">
                No goals set.{" "}
                <button
                  onClick={() => router.push("/settings")}
                  className="underline hover:text-black"
                >
                  Set goals in settings
                </button>
              </p>
            )}
          </div>

          {/* Workout Summary */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Workouts</h2>
              <button
                onClick={() => router.push("/workout")}
                className="text-xs text-gray-400 hover:text-black"
              >
                View All →
              </button>
            </div>

            {data.workouts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-2">
                  No workouts logged today.
                </p>
                <button
                  onClick={() => router.push("/workout")}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                >
                  + Start Workout
                </button>
              </div>
            ) : (
              data.workouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => router.push(`/workout/${workout.id}`)}
                  className="border rounded-lg p-3 mb-2 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {workout.name ?? "Workout"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {workout.exercises.length} exercise
                      {workout.exercises.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {workout.exercises.map((e) => (
                      <span
                        key={e.id}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize"
                      >
                        {e.exercise.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/diary")}
              className="bg-white rounded-xl shadow p-4 text-left hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-sm">🍎 Food Diary</p>
              <p className="text-xs text-gray-400 mt-1">Log your meals</p>
            </button>
            <button
              onClick={() => router.push("/workout")}
              className="bg-white rounded-xl shadow p-4 text-left hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-sm">💪 Workouts</p>
              <p className="text-xs text-gray-400 mt-1">Track your training</p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
