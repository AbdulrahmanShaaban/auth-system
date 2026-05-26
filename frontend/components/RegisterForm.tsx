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

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const registerAuth = useAuthStore((state) => state.register);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as any),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      await registerAuth(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="container max-w-4xl w-full flex justify-center items-center relative">
      <div className="bg-white w-full rounded-xl flex flex-col md:flex-row shadow-sm border border-gray-300 overflow-hidden">
        {/* Image Side */}
        <div className="hidden md:flex md:w-1/2 bg-gray-100 items-center justify-center p-8 border-r border-gray-200">
          <img alt="Goku" className="max-w-full h-auto drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi7mZoaDDXRNVyiBGpPGQSiWt3AUSU5UdheiN3RGcfSmXLJT9Axsw9Fk_5p5m2meUymaCL1V4AgKsSGdmqcaah7trFC-0lEQI4r9ydTcGMf65sdgPv-CXY_6zeczJHu3uTWPWjqpgj0IRJJnm6XXjHG8X5rxOEfOK5pp8oKYFRLDOJVc7kAl-r-SJieFlRIaLefE9owTJs4cAAWqM8S2LcXkpRjyWjKNusOEbKt8hpirAX1m7LmHMOXBnQaNjNng2he9VlJ1kC9Axy" />
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 relative flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-[32px] md:text-[40px] text-gray-900 uppercase tracking-tighter mb-2 font-bold">Capsule Corp</h1>
            <p className="font-body-md text-[16px] text-gray-600">Enter your details below to create your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <Label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="name">Name</Label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">person</span>
                <Input id="name" placeholder="Enter your name" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 font-body-md focus-visible:ring-[#e9c400] focus-visible:border-[#e9c400] transition-colors" {...register("name")} />
              </div>
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">Email</Label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mail</span>
                <Input id="email" type="email" placeholder="user@capsule.corp" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 font-body-md focus-visible:ring-[#e9c400] focus-visible:border-[#e9c400] transition-colors" {...register("email")} />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">Password</Label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">lock</span>
                <Input id="password" type="password" placeholder="••••••••" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 font-body-md focus-visible:ring-[#e9c400] focus-visible:border-[#e9c400] transition-colors" {...register("password")} />
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#e9c400] text-black hover:bg-[#d4b200] transition-colors py-3 rounded font-label-caps text-[12px] uppercase flex items-center justify-center gap-2 mt-6 font-bold tracking-[0.1em]" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Register
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-gray-200 pt-4">
            <p className="font-body-md text-gray-600">
              Already have an account?
              <Link href="/auth/login" className="text-[#b39600] hover:text-[#8a7400] transition-colors ml-1 font-semibold">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
