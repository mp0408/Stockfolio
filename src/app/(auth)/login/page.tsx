"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await signIn(data);
    if (error) {
      toast({ type: "error", title: "Sign in failed", description: error });
    } else {
      toast({ type: "success", title: "Welcome back!" });
      router.push("/dashboard/inventory");
    }
  };

  return (
    <div>
      {/* Mobile branding (shown only on small screens) */}
      <div className="lg:hidden mb-8">
        <h1
          className="text-3xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Stockfolio
        </h1>
        <p className="text-text-secondary mt-1">Your inventory, portfolio-grade.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-text-secondary mt-2">
          Enter your credentials to access your inventory dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={`
              w-full px-4 py-2.5 rounded-[var(--radius-sm)] border
              bg-surface text-foreground placeholder:text-text-tertiary
              transition-default
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
              ${errors.email ? "border-[var(--status-out-of-stock)]" : "border-border"}
            `}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`
                w-full px-4 py-2.5 pr-11 rounded-[var(--radius-sm)] border
                bg-surface text-foreground placeholder:text-text-tertiary
                transition-default
                focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                ${errors.password ? "border-[var(--status-out-of-stock)]" : "border-border"}
              `}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-default"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2.5
            rounded-[var(--radius-sm)] font-medium text-sm
            bg-accent text-accent-foreground
            hover:bg-accent-hover active:scale-[0.98]
            transition-default
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          `}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-accent hover:text-accent-hover font-medium transition-default"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
