"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/home", label: "Home", icon: "🏠" },
    { href: "/diary", label: "Diary", icon: "🍎" },
    { href: "/workout", label: "Workout", icon: "💪" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs ${isActive ? "text-black font-semibold" : "text-gray-400"
                }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}