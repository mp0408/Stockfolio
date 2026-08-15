import { redirect } from "next/navigation";

/**
 * Root page — redirects to login.
 * The middleware handles redirecting authenticated users to the dashboard.
 */
export const dynamic = "force-dynamic";

export default function HomePage() {
  redirect("/login");
}
