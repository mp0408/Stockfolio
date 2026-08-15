


/**
 * Auth layout — centered card on a warm split-screen background.
 * Used for both /login and /signup pages.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0B0C0E 0%, #1A3A35 50%, #1A7A6D 100%)",
        }}
      >
        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Branding content */}
        <div className="relative z-10 max-w-md px-8 text-white">
          <h1
            className="text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Stockfolio
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            Your inventory, portfolio-grade. Track stock levels, manage
            products, and keep your warehouse running smoothly.
          </p>
          <div className="mt-12 flex items-center gap-4 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4A8C5C]" />
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#B8860B]" />
              <span>Smart alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2DD4B8]" />
              <span>Audit logs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
