import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold">Welcome back, {session.user?.name ?? session.user?.email}!</h1>
      <p className="text-gray-500 mt-2">Your dashboard is coming soon.</p>
    </div>
  );
}