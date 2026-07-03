"use client";

import Link from "next/link";
import { Send, FileText, PiggyBank, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Para Gönder",
    desc: "Havale / EFT / FAST",
    icon: Send,
    href: "/transfer",
    color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    border: "hover:border-indigo-300 dark:hover:border-indigo-700",
  },
  {
    label: "Fatura Oluştur",
    desc: "Yeni fatura düzenle",
    icon: FileText,
    href: "/invoices",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    border: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    label: "Bütçe Takibi",
    desc: "Harcama limitleri",
    icon: PiggyBank,
    href: "/budget",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    border: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  {
    label: "Raporlar",
    desc: "Finansal analiz",
    icon: BarChart3,
    href: "/reports",
    color: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    border: "hover:border-violet-300 dark:hover:border-violet-700",
  },
];

export function QuickActions(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-3 transition-all duration-200 hover:shadow-sm",
              a.border
            )}
          >
            <div className={cn("rounded-lg p-2", a.color)}>
              <a.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">{a.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
