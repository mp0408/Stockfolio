import { redirect } from "next/navigation";

// Root page — middleware handles auth redirect, this is the fallback
export const dynamic = "force-dynamic";

export default function HomePage() {
  redirect("/dashboard");
}
