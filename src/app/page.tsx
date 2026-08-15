import { redirect } from "next/navigation";

/**
 * Root page — redirects to the dashboard.
 * Authentication check happens in middleware.
 */
export default function HomePage() {
  redirect("/login");
}
