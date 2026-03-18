"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WorkoutSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type ExerciseSet = {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
};

type WorkoutExercise = {
  id: string;
  order: number;
  exercise: {
    id: string;
    name: string;
    category: string;
    equipment: string | null;
  };
  sets: ExerciseSet[];
};

type Workout = {
  id: string;
  name: string | null;
  date: string;
  exercises: WorkoutExercise[];
};

type Exercise = {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
};

type ExerciseDataPoint = {
  date: string;
  weight: number;
  reps: number;
};

type WeeklyDataPoint = {
  week: string;
  count: number;
};

type ProgressData = {
  exerciseProgress: Record<string, ExerciseDataPoint[]>;
  trackedExercises: string[];
  weeklyData: WeeklyDataPoint[];
  weightUnit: string;
};

export default function WorkoutPage() {
  const [activeTab, setActiveTab] = useState<"history" | "progress">("history");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [range, setRange] = useState("30");
  const [selectedExercise, setSelectedExercise] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  async function fetchWorkouts() {
    setLoading(true);
    const res = await fetch("/api/workouts");
    const data = await res.json();
    setWorkouts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function searchExercises() {
    const res = await fetch(
      `/api/exercises?query=${encodeURIComponent(exerciseQuery)}`,
    );
    const data = await res.json();
    setExercises(Array.isArray(data) ? data : []);
  }

  async function startWorkout() {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date().toISOString() }),
    });
    const data = await res.json();
    setActiveWorkout(data);
  }

  async function addExercise(exercise: Exercise) {
    if (!activeWorkout) return;
    const res = await fetch(`/api/workouts/${activeWorkout.id}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id }),
    });
    const data = await res.json();
    setActiveWorkout((prev) =>
      prev ? { ...prev, exercises: [...prev.exercises, data] } : prev,
    );
    setShowExerciseSearch(false);
    setExerciseQuery("");
    setExercises([]);
  }

  async function addSet(workoutExerciseId: string) {
    const res = await fetch(`/api/workouts/${activeWorkout?.id}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutExerciseId, reps: null, weight: null }),
    });
    const newSet = await res.json();
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === workoutExerciseId ? { ...e, sets: [...e.sets, newSet] } : e,
        ),
      };
    });
  }

  async function updateSet(
    workoutExerciseId: string,
    setId: string,
    field: "reps" | "weight" | "completed",
    value: number | boolean,
  ) {
    await fetch(`/api/workouts/${activeWorkout?.id}/sets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, [field]: value }),
    });
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === workoutExerciseId
            ? {
              ...e,
              sets: e.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s,
              ),
            }
            : e,
        ),
      };
    });
  }

  async function finishWorkout() {
    await fetchWorkouts();
    setActiveWorkout(null);
  }

  async function fetchProgress() {
    setProgressLoading(true);
    const res = await fetch(`/api/progress?range=${range}`);
    const json = await res.json();
    setProgressData(json);
    if (json.trackedExercises?.length && !selectedExercise) {
      setSelectedExercise(json.trackedExercises[0]);
    }
    setProgressLoading(false);
  }

  useEffect(() => {
    if (activeTab === "progress") {
      fetchProgress();
    }
  }, [activeTab, range]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatWeek(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workout</h1>
        {!activeWorkout && activeTab === "history" && (
          <button
            onClick={startWorkout}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            + Start Workout
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["history", "progress"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab
              ? "bg-black text-white"
              : "bg-white text-gray-500 hover:bg-gray-100 shadow"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Workout */}
      {activeWorkout && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Active Workout</h2>
            <button
              onClick={finishWorkout}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
            >
              Finish
            </button>
          </div>

          {activeWorkout.exercises.map((workoutExercise) => (
            <div key={workoutExercise.id} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{workoutExercise.exercise.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {workoutExercise.exercise.category} ·{" "}
                    {workoutExercise.exercise.equipment ?? "bodyweight"}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-1 px-1">
                  <span>Set</span>
                  <span>Weight (kg)</span>
                  <span>Reps</span>
                  <span>Done</span>
                </div>
                {workoutExercise.sets.map((set) => (
                  <div key={set.id} className="grid grid-cols-4 gap-2 items-center mb-1">
                    <span className="text-sm text-gray-500 px-1">{set.setNumber}</span>
                    <input
                      type="number"
                      defaultValue={set.weight ?? ""}
                      onBlur={(e) =>
                        updateSet(workoutExercise.id, set.id, "weight", parseFloat(e.target.value))
                      }
                      className="border rounded px-2 py-1 text-sm w-full"
                      placeholder="0"
                    />
                    <input
                      type="number"
                      defaultValue={set.reps ?? ""}
                      onBlur={(e) =>
                        updateSet(workoutExercise.id, set.id, "reps", parseInt(e.target.value))
                      }
                      className="border rounded px-2 py-1 text-sm w-full"
                      placeholder="0"
                    />
                    <input
                      type="checkbox"
                      checked={set.completed}
                      onChange={(e) =>
                        updateSet(workoutExercise.id, set.id, "completed", e.target.checked)
                      }
                      className="w-4 h-4 mx-auto"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(workoutExercise.id)}
                className="text-sm text-gray-500 hover:text-black"
              >
                + Add Set
              </button>
            </div>
          ))}

          <div className="border-t pt-4 mt-4">
            {showExerciseSearch ? (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={exerciseQuery}
                    onChange={(e) => setExerciseQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchExercises()}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={searchExercises}
                    className="bg-black text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800"
                  >
                    Search
                  </button>
                </div>
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between py-2 border-t text-sm"
                  >
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {exercise.category} · {exercise.equipment ?? "bodyweight"}
                      </p>
                    </div>
                    <button
                      onClick={() => addExercise(exercise)}
                      className="bg-black text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-800"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowExerciseSearch(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600"
              >
                + Add Exercise
              </button>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          {loading ? (
            <WorkoutSkeleton />
          ) : workouts.length === 0 ? (
            <EmptyState
              icon="💪"
              title="No workouts yet"
              message="Start your first workout to begin tracking your training."
              action={{ label: "Start Workout", onClick: startWorkout }}
            />
          ) : (
            workouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => router.push(`/workout/${workout.id}`)}
                className="bg-white rounded-xl shadow p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{workout.name ?? "Workout"}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === "progress" && (
        <div>
          <div className="flex justify-end mb-4">
            <div className="flex gap-1">
              {["30", "60", "90"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${range === r
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>

          {progressLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : !progressData ? (
            <p className="text-gray-400 text-sm">Failed to load progress data.</p>
          ) : (
            <>
              {/* Workout Frequency */}
              <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h2 className="font-semibold mb-3">Workout Frequency</h2>
                {progressData.weeklyData.length === 0 ? (
                  <p className="text-sm text-gray-400">No workouts in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={progressData.weeklyData}>
                      <XAxis
                        dataKey="week"
                        tickFormatter={formatWeek}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                        allowDecimals={false}
                      />
                      <Tooltip
                        labelFormatter={(label) => `Week of ${formatWeek(String(label))}`}
                        formatter={(value: number | undefined) => [
                          `${value ?? 0} workout${(value ?? 0) !== 1 ? "s" : ""}`,
                          "Count",
                        ]}
                      />
                      <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Exercise Progress */}
              <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h2 className="font-semibold mb-3">Exercise Progress</h2>
                {progressData.trackedExercises.length === 0 ? (
                  <EmptyState
                    icon="📈"
                    title="No progress data yet"
                    message="Complete sets with weight and reps to track your strength progress."
                  />
                ) : (
                  <>
                    <select
                      value={selectedExercise}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black mb-4"
                    >
                      {progressData.trackedExercises.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>

                    {(progressData.exerciseProgress[selectedExercise] ?? []).length < 2 ? (
                      <p className="text-sm text-gray-400">
                        Log this exercise on at least 2 days to see a trend.
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={progressData.exerciseProgress[selectedExercise]}>
                          <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
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
                              `${value ?? 0} ${progressData.weightUnit}`,
                              "Best Weight",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="#000000"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}

                    {(progressData.exerciseProgress[selectedExercise] ?? []).length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t text-center">
                        <div>
                          <p className="text-xs text-gray-400">Best Weight</p>
                          <p className="font-semibold text-sm">
                            {Math.max(...(progressData.exerciseProgress[selectedExercise] ?? []).map((d) => d.weight))}{" "}
                            {progressData.weightUnit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Sessions</p>
                          <p className="font-semibold text-sm">
                            {(progressData.exerciseProgress[selectedExercise] ?? []).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">First Logged</p>
                          <p className="font-semibold text-sm">
                            {formatDate((progressData.exerciseProgress[selectedExercise] ?? [])[0]?.date ?? "")}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
