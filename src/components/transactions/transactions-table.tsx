"use client";

import { useState } from "react";
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
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { STATUS_MAP, TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <button
        type="button"
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tarih
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{formatDate(row.getValue("date"))}</span>
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
      <button
        type="button"
        className="flex items-center gap-1 hover:text-foreground ml-auto"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tutar
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const amount = row.getValue<number>("amount");
      return (
        <div className="text-right">
          <span className={cn("text-sm font-semibold", type === "credit" ? "text-emerald-600" : "text-red-500")}>
            {type === "credit" ? "+" : "-"}{formatCurrency(amount)}
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

export function TransactionsTable(): React.JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredData = typeFilter === "all"
    ? mockTransactions
    : mockTransactions.filter((t) => t.type === typeFilter);

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
    initialState: { pagination: { pageSize: 8 } },
  });

  const handleTypeFilterChange = (value: string | null): void => {
    setTypeFilter(value ?? "all");
    table.resetPageIndex();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="İşlem ara..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="credit">Gelir</SelectItem>
            <SelectItem value="debit">Gider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  İşlem bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredData.length} işlemden {table.getFilteredRowModel().rows.length} gösteriliyor
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </Button>
          <span className="text-xs">
            Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}