import { redirect } from "next/navigation";

export default function HomePage() {
  // Simple redirect to dashboard since both are protected
  redirect("/dashboard");
}
