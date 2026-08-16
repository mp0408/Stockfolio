"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  User,
  KeyRound,
  Store,
  Eye,
  EyeOff,
  Loader2,
  Save,
} from "lucide-react";

// Validation schemas
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password needs a lowercase letter, uppercase letter, and a number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const storeSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(100),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type StoreFormData = z.infer<typeof storeSchema>;

export default function SettingsPage() {
  const { profile, store, updatePassword, refreshProfile } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your profile, password, and store settings.
        </p>
      </div>

      {/* Profile section */}
      <ProfileSection
        profile={profile}
        supabase={supabase}
        toast={toast}
        refreshProfile={refreshProfile}
      />

      {/* Change password section */}
      <PasswordSection
        updatePassword={updatePassword}
        toast={toast}
      />

      {/* Store settings section */}
      <StoreSection
        store={store}
        supabase={supabase}
        toast={toast}
        refreshProfile={refreshProfile}
      />
    </div>
  );
}

// Profile update section
function ProfileSection({
  profile,
  supabase,
  toast,
  refreshProfile,
}: {
  profile: ReturnType<typeof useAuth>["profile"];
  supabase: ReturnType<typeof createClient>;
  toast: ReturnType<typeof useToast>["toast"];
  refreshProfile: () => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile?.full_name || "" },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.fullName })
      .eq("id", profile.id);

    if (error) {
      toast({ type: "error", title: "Update failed", description: error.message });
    } else {
      await refreshProfile();
      toast({ type: "success", title: "Profile updated" });
    }
  };

  return (
    <SettingsCard title="Profile" icon={<User className="w-5 h-5" />}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="settings-name"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Full name
          </label>
          <input
            id="settings-name"
            type="text"
            className={`${inputStyles} ${errors.fullName ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={profile?.id ? "" : ""}
            disabled
            className={`${inputStyles} border-border opacity-60 cursor-not-allowed`}
            placeholder="Email cannot be changed"
          />
          <p className="text-xs text-text-tertiary mt-1">
            Email address cannot be changed from settings.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] font-medium text-sm bg-accent text-accent-foreground hover:bg-accent-hover transition-default disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}

// Password change section
function PasswordSection({
  updatePassword,
  toast,
}: {
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: PasswordFormData) => {
    const { error } = await updatePassword(data.newPassword);
    if (error) {
      toast({ type: "error", title: "Password update failed", description: error });
    } else {
      toast({ type: "success", title: "Password changed successfully" });
      reset();
    }
  };

  return (
    <SettingsCard title="Change Password" icon={<KeyRound className="w-5 h-5" />}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="settings-new-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="settings-new-password"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={`${inputStyles} pr-11 ${errors.newPassword ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-default"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="settings-confirm-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="settings-confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              className={`${inputStyles} pr-11 ${errors.confirmPassword ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-default"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] font-medium text-sm bg-accent text-accent-foreground hover:bg-accent-hover transition-default disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            Update password
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}

// Store settings section
function StoreSection({
  store,
  supabase,
  toast,
  refreshProfile,
}: {
  store: ReturnType<typeof useAuth>["store"];
  supabase: ReturnType<typeof createClient>;
  toast: ReturnType<typeof useToast>["toast"];
  refreshProfile: () => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: { storeName: store?.name || "" },
  });

  const onSubmit = async (data: StoreFormData) => {
    if (!store) return;
    const { error } = await supabase
      .from("stores")
      .update({ name: data.storeName })
      .eq("id", store.id);

    if (error) {
      toast({ type: "error", title: "Update failed", description: error.message });
    } else {
      await refreshProfile();
      toast({ type: "success", title: "Store name updated" });
    }
  };

  return (
    <SettingsCard title="Store" icon={<Store className="w-5 h-5" />}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="settings-store"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Store name
          </label>
          <input
            id="settings-store"
            type="text"
            className={`${inputStyles} ${errors.storeName ? "border-[var(--status-out-of-stock)]" : "border-border"}`}
            {...register("storeName")}
          />
          {errors.storeName && (
            <p className="mt-1.5 text-sm text-[var(--status-out-of-stock)]">
              {errors.storeName.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] font-medium text-sm bg-accent text-accent-foreground hover:bg-accent-hover transition-default disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}

// Reusable settings card wrapper
function SettingsCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Shared input classes
const inputStyles = `
  w-full px-4 py-2.5 rounded-[var(--radius-sm)] border
  bg-surface text-foreground placeholder:text-text-tertiary
  transition-default
  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
`;
