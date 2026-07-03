"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown, ChevronDown, ChevronUp, Search, Download,
  TrendingUp, TrendingDown, ArrowLeftRight, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { mockTransactions, mockAccounts } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { STATUS_MAP, TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

// Tüm kategorileri unique çek
const ALL_CATEGORIES = ["Tümü", ...Array.from(new Set(mockTransactions.map((t) => t.category))).sort()];

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <button type="button" className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Tarih <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">{formatDate(row.getValue("date"))}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Açıklama",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.getValue("description")}</p>
        <p className="text-xs text-muted-foreground">{row.original.counterparty}</p>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "transactionType",
    header: "Tür",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {TYPE_LABELS[row.getValue<Transaction["transactionType"]>("transactionType")]}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <button type="button" className="flex items-center gap-1 hover:text-foreground ml-auto"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Tutar
        {column.getIsSorted() === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const amount = row.getValue<number>("amount");
      return (
        <div className="text-right">
          <span className={cn("text-sm font-semibold font-mono tabular-nums", type === "credit" ? "text-emerald-600" : "text-red-500")}>
            {type === "credit" ? "+" : "−"}{formatCurrency(amount)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = STATUS_MAP[row.getValue<Transaction["status"]>("status")];
      return (
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", status.className)}>
          {status.label}
        </span>
      );
    },
  },
];

function TransactionDetail({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  const account = mockAccounts.find((a) => a.id === txn.accountId);
  const status = STATUS_MAP[txn.status];
  const isCredit = txn.type === "credit";

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">İşlem Detayı</SheetTitle>
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Tutar */}
        <div className={cn(
          "rounded-2xl p-5 mb-5 text-center",
          isCredit ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"
        )}>
          <div className={cn("inline-flex items-center gap-2 text-3xl font-bold tabular-nums font-mono",
            isCredit ? "text-emerald-600" : "text-red-500")}>
            {isCredit ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            {isCredit ? "+" : "−"}{formatCurrency(txn.amount)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{txn.description}</p>
        </div>

        {/* Detaylar */}
        <div className="space-y-0.5">
          {[
            { label: "Karşı Taraf", value: txn.counterparty },
            { label: "Tarih", value: formatDate(txn.date) },
            { label: "Kategori", value: txn.category },
            { label: "İşlem Türü", value: TYPE_LABELS[txn.transactionType] },
            { label: "Hesap", value: account?.name ?? txn.accountId },
            { label: "Referans No", value: txn.id.toUpperCase() },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted-foreground">Durum</span>
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", status.className)}>
              {status.label}
            </span>
          </div>
        </div>

        <Separator className="my-4" />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" size="sm">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Makbuz İndir
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
            İşlemi Tekrarla
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TransactionsTable(): React.JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("Tümü");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const filteredData = useMemo(() => {
    return mockTransactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "Tümü" && t.category !== categoryFilter) return false;
      return true;
    });
  }, [typeFilter, categoryFilter]);

  // Stat hesaplama
  const stats = useMemo(() => {
    const totalIn = filteredData.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const totalOut = filteredData.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
    const net = totalIn - totalOut;
    return { totalIn, totalOut, net, count: filteredData.length };
  }, [filteredData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleExportCSV = () => {
    const rows = [
      ["Tarih", "Açıklama", "Karşı Taraf", "Kategori", "Tür", "Tutar", "Durum"],
      ...filteredData.map((t) => [
        t.date, t.description, t.counterparty, t.category,
        TYPE_LABELS[t.transactionType],
        (t.type === "credit" ? "+" : "-") + t.amount.toFixed(2),
        STATUS_MAP[t.status].label,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "islemler.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Stat Kartları */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Toplam Gelir</p>
            <p className="text-xl font-bold text-emerald-600 font-mono mt-1">+{formatCurrency(stats.totalIn)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{filteredData.filter(t => t.type === "credit").length} işlem</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Toplam Gider</p>
            <p className="text-xl font-bold text-red-500 font-mono mt-1">−{formatCurrency(stats.totalOut)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{filteredData.filter(t => t.type === "debit").length} işlem</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Net Bakiye</p>
            <p className={cn("text-xl font-bold font-mono mt-1", stats.net >= 0 ? "text-emerald-600" : "text-red-500")}>
              {stats.net >= 0 ? "+" : ""}{formatCurrency(stats.net)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stats.count} toplam işlem</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="İşlem ara..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); table.resetPageIndex(); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İşlemler</SelectItem>
            <SelectItem value="credit">Gelir</SelectItem>
            <SelectItem value="debit">Gider</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); table.resetPageIndex(); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {ALL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5" />
            CSV İndir
          </Button>
        </div>
      </div>

      {/* Tablo */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelectedTxn(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  İşlem bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} işlemden{" "}
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          gösteriliyor
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detay Drawer */}
      {selectedTxn && (
        <TransactionDetail txn={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}
    </div>
  );
}