"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "@/lib/validators/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  ChevronDown,
} from "lucide-react";

export default function SignupPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      storeName: "",
      role: "manager",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    const { error, needsEmailConfirmation } = await signUp(data);
    if (error) {
      toast({ type: "error", title: "Signup failed", description: error });
    } else if (needsEmailConfirmation) {
      toast({
        type: "success",
        title: "Check your email",
        description:
          "We sent a confirmation link to your email address. Please verify it, then sign in.",
      });
      router.push("/login");
    } else {
      toast({
        type: "success",
        title: "Account created",
        description: "Welcome to Stockfolio! Setting up your dashboard.",
      });
      router.refresh();
      router.push("/dashboard");
    }
  };

  /* Shared input styles */
  const inputBase = `
    w-full px-4 py-2.5 rounded-[var(--radius-sm)] border
    bg-surface text-foreground placeholder:text-text-tertiary
    transition-default
    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
  `;

  return (
    <div>
      {/* Mobile branding */}
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
          Create your account
        </h2>
        <p className="text-text-secondary mt-2">
          Set up your store and start tracking inventory in minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            className={`${inputBase} ${
              errors.fullName
                ? "border-[var(--status-out-of-stock)]"
                : "border-border"
            }`}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="jane@company.com"
            className={`${inputBase} ${
              errors.email
                ? "border-[var(--status-out-of-stock)]"
                : "border-border"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={`${inputBase} pr-11 ${
                errors.password
                  ? "border-[var(--status-out-of-stock)]"
                  : "border-border"
              }`}
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

        {/* Store name */}
        <div>
          <label
            htmlFor="signup-store"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Store / warehouse name
          </label>
          <input
            id="signup-store"
            type="text"
            placeholder="Acme Warehouse"
            className={`${inputBase} ${
              errors.storeName
                ? "border-[var(--status-out-of-stock)]"
                : "border-border"
            }`}
            {...register("storeName")}
          />
          {errors.storeName && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.storeName.message}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="signup-role"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Your role
          </label>
          <div className="relative">
            <select
              id="signup-role"
              className={`${inputBase} appearance-none cursor-pointer ${
                errors.role
                  ? "border-[var(--status-out-of-stock)]"
                  : "border-border"
              }`}
              {...register("role")}
            >
              <option value="manager">Warehouse Manager</option>
              <option value="staff">Staff Member</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          </div>
          {errors.role && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Submit */}
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
            <UserPlus className="w-4 h-4" />
          )}
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      {/* Sign in link */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover font-medium transition-default"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
