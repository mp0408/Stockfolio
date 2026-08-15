"use client";

import { cn } from "@/lib/utils";

interface UserBadgeProps {
  fullName: string;
  role: string;
  storeName?: string;
  avatarUrl?: string | null;
  className?: string;
}

/**
 * Displays the user's avatar (or initials), name, and role.
 * Used in the dashboard header.
 */
export function UserBadge({
  fullName,
  role,
  storeName,
  avatarUrl,
  className,
}: UserBadgeProps) {
  // Get initials from full name (first letter of first two words)
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const roleLabel = role === "manager" ? "Manager" : "Staff";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Avatar / Initials circle */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-9 h-9 rounded-full object-cover border border-border"
        />
      ) : (
        <div
          className={`
            w-9 h-9 rounded-full flex items-center justify-center
            bg-accent/10 text-accent text-sm font-semibold
            border border-accent/20
          `}
        >
          {initials}
        </div>
      )}

      {/* Name and role (hidden on small screens) */}
      <div className="hidden sm:block text-left">
        <p className="text-sm font-medium text-foreground leading-tight">
          {fullName}
        </p>
        <p className="text-xs text-text-tertiary leading-tight">
          {roleLabel}
          {storeName && (
            <>
              {" · "}
              <span className="text-text-secondary">{storeName}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
