"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validators/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const { error } = await updatePassword(data.password);
    if (error) {
      toast({
        type: "error",
        title: "Password update failed",
        description: error,
      });
    } else {
      setResetDone(true);
      toast({
        type: "success",
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
    }
  };

  // Success state
  if (resetDone) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-status-in-stock-bg flex items-center justify-center mx-auto mb-5 border border-[var(--status-in-stock-border)]">
          <CheckCircle className="w-8 h-8 text-[var(--status-in-stock)]" />
        </div>

        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
          Password updated
        </h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          Your password has been changed successfully. You can now sign in with
          your new password.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] font-medium text-sm bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-default"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to sign in
        </button>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Stockfolio
        </h1>
        <p className="text-text-secondary mt-1">
          Your inventory, portfolio-grade.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Set new password
        </h2>
        <p className="text-text-secondary mt-2">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New password */}
        <div>
          <label
            htmlFor="reset-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="reset-password"
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

        {/* Confirm password */}
        <div>
          <label
            htmlFor="reset-confirm"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="reset-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              className={`${inputBase} pr-11 ${
                errors.confirmPassword
                  ? "border-[var(--status-out-of-stock)]"
                  : "border-border"
              }`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-default"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] font-medium text-sm bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-default disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <KeyRound className="w-4 h-4" />
          )}
          {isSubmitting ? "Updating password…" : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium transition-default"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
