"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/Skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

type DailyNutrition = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type WeeklyAverages = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} | null;

type Goals = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

type WorkoutStats = {
  totalWorkouts: number;
  workoutsThisWeek: number;
};

type TopMuscle = {
  category: string;
  count: number;
};

type PersonalRecord = {
  name: string;
  weight: number;
  reps: number;
};

type RecentWorkout = {
  id: string;
  name: string | null;
  date: string;
  exerciseCount: number;
};

type StatsData = {
  dailyNutrition: DailyNutrition[];
  weeklyAverages: WeeklyAverages;
  goals: Goals;
  workoutStats: WorkoutStats;
  topMuscles: TopMuscle[];
  personalRecords: PersonalRecord[];
  recentWorkouts: RecentWorkout[];
};

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNutrient, setActiveNutrient] = useState<
    "calories" | "protein" | "carbs" | "fat"
  >("calories");

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    const res = await fetch("/api/stats");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : !data ? (
        <p className="text-center text-gray-400">Failed to load data.</p>
      ) : (
        <>
          {/* Workout Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-3xl font-bold">
                {data.workoutStats.workoutsThisWeek}
              </p>
              <p className="text-xs text-gray-400 mt-1">Workouts this week</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-3xl font-bold">
                {data.workoutStats.totalWorkouts}
              </p>
              <p className="text-xs text-gray-400 mt-1">Workouts this month</p>
            </div>
          </div>

          {/* Nutrition Trends */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h2 className="font-semibold mb-3">Nutrition — Last 7 Days</h2>

            {/* Nutrient selector */}
            <div className="flex gap-2 mb-4">
              {(["calories", "protein", "carbs", "fat"] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setActiveNutrient(n)}
                  className={`text-xs px-3 py-1 rounded-full capitalize ${activeNutrient === n
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Line chart */}
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.dailyNutrition}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  labelFormatter={(label) => formatDate(String(label))}
                  formatter={(value: number | undefined) => [
                    `${(value ?? 0).toFixed(1)}${activeNutrient === "calories" ? " kcal" : "g"}`,
                    activeNutrient,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey={activeNutrient}
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Weekly averages */}
            {data.weeklyAverages && (
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t text-center">
                {[
                  {
                    label: "Avg Cal",
                    value: data.weeklyAverages.calories.toFixed(0),
                    unit: "kcal",
                  },
                  {
                    label: "Avg Protein",
                    value: data.weeklyAverages.protein.toFixed(1),
                    unit: "g",
                  },
                  {
                    label: "Avg Carbs",
                    value: data.weeklyAverages.carbs.toFixed(1),
                    unit: "g",
                  },
                  {
                    label: "Avg Fat",
                    value: data.weeklyAverages.fat.toFixed(1),
                    unit: "g",
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <p className="font-semibold text-sm">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Muscles */}
          {data.topMuscles.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <h2 className="font-semibold mb-3">
                Most Trained — Last 30 Days
              </h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.topMuscles} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      `${value ?? 0} exercises`,
                      "Count",
                    ]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.topMuscles.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Personal Records */}
          {data.personalRecords.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <h2 className="font-semibold mb-3">
                Personal Records — Last 30 Days
              </h2>
              {data.personalRecords.map((pr) => (
                <div
                  key={pr.name}
                  className="flex items-center justify-between py-2 border-t text-sm"
                >
                  <p className="font-medium">{pr.name}</p>
                  <div className="text-right">
                    <p className="font-semibold">{pr.weight} kg</p>
                    <p className="text-xs text-gray-400">{pr.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Workouts */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recent Workouts</h2>
              <button
                onClick={() => router.push("/workout")}
                className="text-xs text-gray-400 hover:text-black"
              >
                View All →
              </button>
            </div>
            {data.recentWorkouts.length === 0 ? (
              <p className="text-sm text-gray-400">No workouts logged yet.</p>
            ) : (
              data.recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => router.push(`/workout/${workout.id}`)}
                  className="flex items-center justify-between py-2 border-t text-sm cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{workout.name ?? "Workout"}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(workout.date)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {workout.exerciseCount} exercise
                    {workout.exerciseCount !== 1 ? "s" : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
