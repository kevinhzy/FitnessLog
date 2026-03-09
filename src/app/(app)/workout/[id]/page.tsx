"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type Exercise = {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
};

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
  notes: string | null;
  date: string;
  exercises: WorkoutExercise[];
};

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  async function fetchWorkout() {
    setLoading(true);
    const res = await fetch(`/api/workouts/${id}`);
    const data = await res.json();
    setWorkout(data);
    setName(data.name ?? "");
    setNotes(data.notes ?? "");
    setLoading(false);
  }

  async function saveName() {
    await fetch(`/api/workouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setWorkout((prev) => (prev ? { ...prev, name } : prev));
    setEditingName(false);
  }

  async function saveNotes() {
    await fetch(`/api/workouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setWorkout((prev) => (prev ? { ...prev, notes } : prev));
  }

  async function updateSet(
    workoutExerciseId: string,
    setId: string,
    field: "reps" | "weight" | "completed",
    value: number | boolean,
  ) {
    await fetch(`/api/workouts/${id}/sets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, [field]: value }),
    });
    setWorkout((prev) => {
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

  async function addSet(workoutExerciseId: string) {
    const res = await fetch(`/api/workouts/${id}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutExerciseId, reps: null, weight: null }),
    });
    const newSet = await res.json();
    setWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === workoutExerciseId ? { ...e, sets: [...e.sets, newSet] } : e,
        ),
      };
    });
  }

  async function deleteSet(workoutExerciseId: string, setId: string) {
    await fetch(`/api/workouts/${id}/sets?id=${setId}`, {
      method: "DELETE",
    });
    setWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === workoutExerciseId
            ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
            : e,
        ),
      };
    });
  }

  async function deleteWorkout() {
    if (!confirm("Are you sure you want to delete this workout?")) return;
    await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    router.push("/workout");
  }

  async function searchExercises() {
    const res = await fetch(
      `/api/exercises?query=${encodeURIComponent(exerciseQuery)}`,
    );
    const data = await res.json();
    setExercises(Array.isArray(data) ? data : []);
  }

  async function addExercise(exercise: Exercise) {
    const res = await fetch(`/api/workouts/${id}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id }),
    });
    const data = await res.json();
    setWorkout((prev) =>
      prev ? { ...prev, exercises: [...prev.exercises, data] } : prev,
    );
    setShowExerciseSearch(false);
    setExerciseQuery("");
    setExercises([]);
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );

  if (!workout)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Workout not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/workout")}
          className="text-gray-400 hover:text-black text-sm"
        >
          ← Back
        </button>
      </div>

      {/* Workout Name */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">
            {new Date(workout.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <button
            onClick={deleteWorkout}
            className="text-red-400 hover:text-red-600 text-xs"
          >
            Delete Workout
          </button>
        </div>
        {editingName ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Workout name"
              autoFocus
            />
            <button
              onClick={saveName}
              className="bg-black text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-left w-full"
          >
            <h1 className="text-xl font-bold hover:text-gray-600">
              {workout.name ?? "Untitled Workout"} ✏️
            </h1>
          </button>
        )}

        {/* Notes */}
        <div className="mt-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Add notes..."
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none text-gray-600"
          />
        </div>
      </div>

      {/* Exercises */}
      {workout.exercises.map((workoutExercise) => (
        <div
          key={workoutExercise.id}
          className="bg-white rounded-xl shadow p-4 mb-4"
        >
          <div className="mb-3">
            <p className="font-semibold">{workoutExercise.exercise.name}</p>
            <p className="text-xs text-gray-400 capitalize">
              {workoutExercise.exercise.category} ·{" "}
              {workoutExercise.exercise.equipment ?? "bodyweight"}
            </p>
          </div>

          {/* Set Headers */}
          <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 mb-1 px-1">
            <span>Set</span>
            <span>Weight (kg)</span>
            <span>Reps</span>
            <span>Done</span>
            <span></span>
          </div>

          {/* Sets */}
          {workoutExercise.sets.map((set) => (
            <div
              key={set.id}
              className="grid grid-cols-5 gap-2 items-center mb-2"
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
                    parseFloat(e.target.value),
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
                    parseInt(e.target.value),
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
                    e.target.checked,
                  )
                }
                className="w-4 h-4 mx-auto"
              />
              <button
                onClick={() => deleteSet(workoutExercise.id, set.id)}
                className="text-red-400 hover:text-red-600 text-xs text-center"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={() => addSet(workoutExercise.id)}
            className="text-sm text-gray-500 hover:text-black mt-1"
          >
            + Add Set
          </button>
        </div>
      ))}
      {/* Add Exercise */}
      <div className="mt-2">
        {showExerciseSearch ? (
          <div className="bg-white rounded-xl shadow p-4">
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
              <button
                onClick={() => {
                  setShowExerciseSearch(false);
                  setExerciseQuery("");
                  setExercises([]);
                }}
                className="text-gray-400 hover:text-black px-2"
              >
                ✕
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
  );
}
