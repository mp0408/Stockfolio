import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

/**
 * Custom 404 page — designed, not default.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-surface-secondary flex items-center justify-center mx-auto mb-6 border border-border">
          <PackageX className="w-8 h-8 text-text-tertiary" />
        </div>

        <h1
          className="text-4xl font-bold text-foreground mb-3"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Page not found
        </h1>
        <p className="text-text-secondary leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Head back to the dashboard to manage your inventory.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] font-medium text-sm bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-default"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
