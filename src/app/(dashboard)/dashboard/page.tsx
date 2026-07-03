import { DashboardContent } from "@/components/dashboard/dashboard-content";

function getCurrentMonthLabel(): string {
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date());
}

function getLastUpdatedLabel(): string {
  const now = new Date();
  const date = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(now);
  const time = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(now);
  return `${date} ${time}`;
}

export default function DashboardPage(): React.JSX.Element {
  const monthLabel = getCurrentMonthLabel();
  const timeLabel = getLastUpdatedLabel();

  return <DashboardContent monthLabel={monthLabel} timeLabel={timeLabel} />;
}