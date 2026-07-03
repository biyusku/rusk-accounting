"use client";

import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockInvoices } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Invoice } from "@/types";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<Invoice["status"], { label: string; className: string }> = {
  paid: { label: "Ödendi", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending: { label: "Bekliyor", className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" },
  overdue: { label: "Gecikmiş", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
  draft: { label: "Taslak", className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400" },
};

export default function InvoicesPage(): React.JSX.Element {
  const [search, setSearch] = useState("");

  const filtered = mockInvoices.filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    paid: mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    pending: mockInvoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0),
    overdue: mockInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Faturalar</h1>
            <p className="text-muted-foreground text-sm mt-1">Fatura yönetimi ve takibi</p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Fatura
          </Button>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Tahsil Edilen", value: totals.paid, color: "text-emerald-600" },
            { label: "Bekleyen", value: totals.pending, color: "text-yellow-600" },
            { label: "Gecikmiş", value: totals.overdue, color: "text-red-500" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className={cn("text-xl font-bold mt-1", item.color)}>
                  {formatCurrency(item.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </BlurFade>

      <BlurFade delay={0.2} inView>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Fatura veya müşteri ara..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase tracking-wide">Fatura No</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Müşteri</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Düzenlenme</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Vade</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Tutar</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Durum</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => {
                    const status = STATUS_MAP[inv.status];
                    return (
                      <TableRow key={inv.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                        <TableCell className="font-medium text-sm">{inv.clientName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">{formatCurrency(inv.amount)}</TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", status.className)}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">Görüntüle</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}