import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockInvoices } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types";

const STATUS_CONFIG: Record<
  Invoice["status"],
  { label: string; dot: string; text: string }
> = {
  paid:    { label: "Ödendi",   dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  pending: { label: "Bekliyor", dot: "bg-yellow-400",  text: "text-yellow-600 dark:text-yellow-400" },
  overdue: { label: "Gecikmiş", dot: "bg-red-500",     text: "text-red-600 dark:text-red-400" },
  draft:   { label: "Taslak",   dot: "bg-gray-400",    text: "text-gray-500" },
};

export function InvoiceSummary(): React.JSX.Element {
  const groups = (["paid", "pending", "overdue", "draft"] as Invoice["status"][]).map(
    (status) => {
      const items = mockInvoices.filter((i) => i.status === status);
      return {
        status,
        count: items.length,
        total: items.reduce((s, i) => s + i.amount, 0),
        ...STATUS_CONFIG[status],
      };
    }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Fatura Durumu</CardTitle>
        <Link href="/invoices" className="text-xs text-primary hover:underline">
          Tümü
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {groups.map((g) => (
          <div key={g.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full flex-shrink-0", g.dot)} />
              <span className="text-sm text-muted-foreground">{g.label}</span>
              <span className="text-xs text-muted-foreground/60">({g.count})</span>
            </div>
            <span className={cn("text-sm font-semibold tabular-nums", g.text)}>
              {formatCurrency(g.total)}
            </span>
          </div>
        ))}
        <div className="pt-2 border-t mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Toplam</span>
            <span className="text-sm font-bold">
              {formatCurrency(mockInvoices.reduce((s, i) => s + i.amount, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}