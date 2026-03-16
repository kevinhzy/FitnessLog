"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { SettingsSkeleton } from "@/components/Skeleton";

type Profile = {
    calorieGoal: number | null;
    proteinGoal: number | null;
    carbGoal: number | null;
    fatGoal: number | null;
    weight: number | null;
    height: number | null;
    dateOfBirth: string | null;
    activityLevel: string | null;
    weightUnit: string;
};

export default function SettingsPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        setLoading(true);
        const res = await fetch("/api/profile");
        const data = await res.json();
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setProfile(data.profile ?? {
            calorieGoal: null,
            proteinGoal: null,
            carbGoal: null,
            fatGoal: null,
            weight: null,
            height: null,
            dateOfBirth: null,
            activityLevel: null,
            weightUnit: "kg",
        });
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, ...profile }),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    function updateProfile(field: keyof Profile, value: string | number | null) {
        setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <SettingsSkeleton />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                    {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
                </button>
            </div>

            {/* Account */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h2 className="font-semibold mb-3">Account</h2>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                </div>
            </div>

            {/* Nutrition Goals */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h2 className="font-semibold mb-3">Nutrition Goals</h2>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Calorie Goal", field: "calorieGoal" as keyof Profile, unit: "kcal" },
                        { label: "Protein Goal", field: "proteinGoal" as keyof Profile, unit: "g" },
                        { label: "Carb Goal", field: "carbGoal" as keyof Profile, unit: "g" },
                        { label: "Fat Goal", field: "fatGoal" as keyof Profile, unit: "g" },
                    ].map(({ label, field, unit }) => (
                        <div key={field}>
                            <label className="block text-xs text-gray-500 mb-1">
                                {label} ({unit})
                            </label>
                            <input
                                type="number"
                                value={profile?.[field] ?? ""}
                                onChange={(e) =>
                                    updateProfile(
                                        field,
                                        e.target.value ? parseFloat(e.target.value) : null
                                    )
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Not set"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Body Stats */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h2 className="font-semibold mb-3">Body Stats</h2>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Weight Unit</label>
                        <div className="flex gap-2">
                            {["kg", "lbs"].map((unit) => (
                                <button
                                    key={unit}
                                    onClick={() => updateProfile("weightUnit", unit)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${profile?.weightUnit === unit
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    {unit}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                Weight ({profile?.weightUnit ?? "kg"})
                            </label>
                            <input
                                type="number"
                                value={profile?.weight ?? ""}
                                onChange={(e) =>
                                    updateProfile(
                                        "weight",
                                        e.target.value ? parseFloat(e.target.value) : null
                                    )
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Not set"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                value={profile?.height ?? ""}
                                onChange={(e) =>
                                    updateProfile(
                                        "height",
                                        e.target.value ? parseFloat(e.target.value) : null
                                    )
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Not set"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={profile?.dateOfBirth?.split("T")[0] ?? ""}
                            onChange={(e) => updateProfile("dateOfBirth", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Activity Level</label>
                        <select
                            value={profile?.activityLevel ?? ""}
                            onChange={(e) => updateProfile("activityLevel", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="">Not set</option>
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Lightly Active</option>
                            <option value="moderate">Moderately Active</option>
                            <option value="very">Very Active</option>
                            <option value="extra">Extra Active</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sign Out */}
            <div className="bg-white rounded-xl shadow p-4">
                <h2 className="font-semibold mb-3">Account Actions</h2>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full border border-red-300 text-red-500 rounded-lg py-2 text-sm font-medium hover:bg-red-50"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}