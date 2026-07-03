import { redirect } from "next/navigation";

export default function RootDashboardPage(): never {
  redirect("/dashboard");
}