import { redirect } from "next/navigation";

export default function Page() {
  // Redirect root to the authenticated dashboard
  redirect("/dashboard");
}
