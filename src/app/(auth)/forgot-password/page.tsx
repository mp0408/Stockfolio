"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validators/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const { error } = await resetPassword(data.email);
    if (error) {
      toast({ type: "error", title: "Reset failed", description: error });
    } else {
      setEmailSent(true);
    }
  };

  // Success state after email is sent
  if (emailSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-status-in-stock-bg flex items-center justify-center mx-auto mb-5 border border-[var(--status-in-stock-border)]">
          <CheckCircle className="w-8 h-8 text-[var(--status-in-stock)]" />
        </div>

        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
          Check your email
        </h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          We sent a password reset link to{" "}
          <span className="font-medium text-foreground">
            {getValues("email")}
          </span>
          . Click the link in the email to set a new password.
        </p>
        <p className="text-sm text-text-tertiary mb-6">
          Didn&apos;t receive an email? Check your spam folder or try again.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setEmailSent(false)}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-border bg-surface text-foreground hover:bg-surface-secondary font-medium text-sm transition-default"
          >
            Try a different email
          </button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm text-accent hover:text-accent-hover font-medium transition-default"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
        <p className="text-text-secondary mt-1">
          Your inventory, portfolio-grade.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Reset your password
        </h2>
        <p className="text-text-secondary mt-2">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email field */}
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Email address
          </label>
          <input
            id="forgot-email"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] font-medium text-sm bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-default disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {isSubmitting ? "Sending link…" : "Send reset link"}
        </button>
      </form>

      {/* Back to login */}
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
