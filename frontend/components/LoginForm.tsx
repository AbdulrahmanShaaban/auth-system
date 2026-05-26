"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as any),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      await login(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl mx-auto">
      {/* Hero Image Side */}
      <div className="hidden md:flex flex-1 justify-end">
        <img alt="Goku standing heroically" className="max-h-[500px] object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi7mZoaDDXRNVyiBGpPGQSiWt3AUSU5UdheiN3RGcfSmXLJT9Axsw9Fk_5p5m2meUymaCL1V4AgKsSGdmqcaah7trFC-0lEQI4r9ydTcGMf65sdgPv-CXY_6zeczJHu3uTWPWjqpgj0IRJJnm6XXjHG8X5rxOEfOK5pp8oKYFRLDOJVc7kAl-r-SJieFlRIaLefE9owTJs4cAAWqM8S2LcXkpRjyWjKNusOEbKt8hpirAX1m7LmHMOXBnQaNjNng2he9VlJ1kC9Axy" />
      </div>

      {/* Login Card Side */}
      <div className="w-full max-w-md bg-white border border-gray-300 rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg-mobile text-[24px] text-gray-900 mb-2 font-bold">Login</h1>
          <p className="font-body-md text-sm text-gray-500">Enter your email below to login to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <Label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">Email</Label>
            <Input className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-2 focus-visible:ring-1 focus-visible:ring-[#e9c400] focus-visible:border-[#e9c400] font-body-md placeholder:text-gray-400 transition-colors" id="email" type="email" placeholder="name@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">Password</Label>
            <Input className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-2 focus-visible:ring-1 focus-visible:ring-[#e9c400] focus-visible:border-[#e9c400] font-body-md placeholder:text-gray-400 transition-colors" id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-6 bg-[#ffd700] text-[#705e00] font-semibold py-2.5 px-4 rounded-md hover:bg-[#e6c200] transition-colors flex items-center justify-center" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Login
          </Button>

          <div className="border-t border-gray-200 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account? <Link href="/auth/register" className="text-[#e9c400] hover:underline font-medium">Register here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
