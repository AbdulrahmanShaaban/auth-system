"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <header className="relative z-10 flex justify-between items-center px-[20px] md:px-[64px] py-8 w-full max-w-[1440px] mx-auto border-b border-gray-200">
      <Link href="/" className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#e9c400] text-[32px]">science</span>
        <span className="font-headline-lg-mobile text-[32px] font-bold text-gray-900 tracking-tighter uppercase">Capsule Corp</span>
      </Link>
      
      {!isLoading && (
        <div className="flex items-center gap-6 font-body-md text-gray-600">
          {user ? (
            <>
              <span className="text-sm font-medium text-gray-700">Hello, {user.name}</span>
              <Button variant="outline" onClick={handleLogout} className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="bg-[#ffd700] text-[#705e00] px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-semibold">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
