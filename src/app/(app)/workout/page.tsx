"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [loading, setLoading] = useState(false);
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
      `/api/exercises?query=${encodeURIComponent(exerciseQuery)}`
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
      prev ? { ...prev, exercises: [...prev.exercises, data] } : prev
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
          e.id === workoutExerciseId
            ? { ...e, sets: [...e.sets, newSet] }
            : e
        ),
      };
    });
  }

  async function updateSet(
    workoutExerciseId: string,
    setId: string,
    field: "reps" | "weight" | "completed",
    value: number | boolean
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
                  s.id === setId ? { ...s, [field]: value } : s
                ),
              }
            : e
        ),
      };
    });
  }

  async function finishWorkout() {
    await fetchWorkouts();
    setActiveWorkout(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        {!activeWorkout && (
          <button
            onClick={startWorkout}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            + Start Workout
          </button>
        )}
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

          {/* Exercises */}
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

              {/* Sets */}
              <div className="mb-2">
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-1 px-1">
                  <span>Set</span>
                  <span>Weight (kg)</span>
                  <span>Reps</span>
                  <span>Done</span>
                </div>
                {workoutExercise.sets.map((set) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-4 gap-2 items-center mb-1"
                  >
                    <span className="text-sm text-gray-500 px-1">
                      {set.setNumber}
                    </span>
                    <input
                      type="number"
                      defaultValue={set.weight ?? ""}
                      onBlur={(e) =>
                        updateSet(
                          workoutExercise.id,
                          set.id,
                          "weight",
                          parseFloat(e.target.value)
                        )
                      }
                      className="border rounded px-2 py-1 text-sm w-full"
                      placeholder="0"
                    />
                    <input
                      type="number"
                      defaultValue={set.reps ?? ""}
                      onBlur={(e) =>
                        updateSet(
                          workoutExercise.id,
                          set.id,
                          "reps",
                          parseInt(e.target.value)
                        )
                      }
                      className="border rounded px-2 py-1 text-sm w-full"
                      placeholder="0"
                    />
                    <input
                      type="checkbox"
                      checked={set.completed}
                      onChange={(e) =>
                        updateSet(
                          workoutExercise.id,
                          set.id,
                          "completed",
                          e.target.checked
                        )
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

          {/* Add Exercise */}
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

      {/* Workout History */}
      <div>
        <h2 className="font-semibold mb-3">History</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : workouts.length === 0 ? (
          <p className="text-gray-400 text-sm">No workouts yet.</p>
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
    </div>
  );
}
