"use client";

import { useAuthStore } from "@/lib/store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return null; // Let middleware handle redirect
  }

  return (
    <main className="flex-1 w-full flex items-center justify-center p-6 min-h-[calc(100vh-100px)]">
      <div className="bg-white border border-gray-800 rounded-xl p-8 max-w-3xl w-full shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="shrink-0">
          <img alt="Happy Gohan" className="w-48 h-48 object-contain drop-shadow-md" src="/images/gohan.png" />
        </div>

        <div className="flex-1">
          <h1 className="font-headline-lg text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="font-body-md text-gray-600 mb-8">Welcome back to your protected dashboard!</p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-bold text-gray-900 min-w-[60px]">Name:</span>
              <span className="text-gray-700">{user.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-bold text-gray-900 min-w-[60px]">Email:</span>
              <span className="text-gray-700">{user.email}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-bold text-gray-900 min-w-[60px]">Role:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffd700] text-gray-900 capitalize">
                {user.role || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
