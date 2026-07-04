"use client";

import { useState, useEffect, useMemo } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getInvoices, updateInvoice } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Download, Send, Eye, FileText,
  CheckCircle2, Clock, AlertTriangle, FileEdit, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { Invoice } from "@/types";

const STATUS_CONFIG: Record<Invoice["status"], { label: string; icon: React.ReactNode; className: string; cardClass: string }> = {
  paid:    { label: "Ödendi",   icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "bg-emerald-100 text-emerald-700 border-emerald-200", cardClass: "border-emerald-200 bg-emerald-50/50" },
  pending: { label: "Bekliyor", icon: <Clock className="h-3.5 w-3.5" />,        className: "bg-yellow-100 text-yellow-700 border-yellow-200",  cardClass: "border-yellow-200 bg-yellow-50/50" },
  overdue: { label: "Gecikmiş", icon: <AlertTriangle className="h-3.5 w-3.5" />,className: "bg-red-100 text-red-700 border-red-200",           cardClass: "border-red-200 bg-red-50/50" },
  draft:   { label: "Taslak",   icon: <FileEdit className="h-3.5 w-3.5" />,     className: "bg-gray-100 text-gray-600 border-gray-200",        cardClass: "border-gray-200" },
};

function InvoiceDetail({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  const cfg = STATUS_CONFIG[inv.status];
  const kdvRate = (inv as Invoice & { kdvRate?: number }).kdvRate ?? 20;
  const kdv = inv.amount * (kdvRate / 100);
  const net = inv.amount;
  const total = net + kdv;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[500px] sm:w-[560px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Fatura Detayı</SheetTitle>
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Fatura başlık */}
        <div className={cn("rounded-2xl border p-5 mb-5", cfg.cardClass)}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-mono">{inv.invoiceNumber}</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p>
              <p className="text-sm text-muted-foreground mt-0.5">KDV dahil</p>
            </div>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", cfg.className)}>
              {cfg.icon}{cfg.label}
            </span>
          </div>
        </div>

        {/* Müşteri & tarih bilgisi */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Müşteri", value: inv.clientName },
            { label: "Fatura No", value: inv.invoiceNumber },
            { label: "Düzenlenme", value: formatDate(inv.issueDate) },
            { label: "Son Ödeme", value: formatDate(inv.dueDate) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-muted/40 px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Kalemler */}
        <div className="rounded-xl border overflow-hidden mb-4">
          <div className="bg-muted/40 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fatura Kalemleri</p>
          </div>
          <div className="divide-y">
            {inv.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} adet × {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums font-mono">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
          <div className="bg-muted/20 px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ara Toplam</span>
              <span className="font-mono tabular-nums">{formatCurrency(net)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">KDV (%{kdvRate})</span>
              <span className="font-mono tabular-nums">{formatCurrency(kdv)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Toplam</span>
              <span className="font-mono tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("PDF indiriliyor...")}>
            <Download className="h-3.5 w-3.5" />PDF İndir
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Fatura gönderildi!")}>
            <Send className="h-3.5 w-3.5" />E-posta Gönder
          </Button>
          {inv.status === "pending" && (
            <Button size="sm" className="col-span-2 gap-1.5" onClick={() => { toast.success("Fatura ödendi olarak işaretlendi!"); onClose(); }}>
              <CheckCircle2 className="h-3.5 w-3.5" />Ödendi Olarak İşaretle
            </Button>
          )}
          {inv.status === "overdue" && (
            <Button variant="destructive" size="sm" className="col-span-2 gap-1.5" onClick={() => toast.info("Ödeme hatırlatması gönderildi.")}>
              <Send className="h-3.5 w-3.5" />Ödeme Hatırlatması Gönder
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NewInvoiceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [kdvRate, setKdvRate] = useState<number>(20);
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [qty, setQty] = useState<string>("1");

  const net = parseFloat(unitPrice || "0") * parseFloat(qty || "1");
  const kdv = net * (kdvRate / 100);
  const total = net + kdv;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Fatura Oluştur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Müşteri Adı</Label>
              <Input placeholder="ABC Ltd." />
            </div>
            <div className="space-y-1.5">
              <Label>Fatura No</Label>
              <Input placeholder="FTR-2026-006" defaultValue="FTR-2026-006" />
            </div>
            <div className="space-y-1.5">
              <Label>Düzenlenme Tarihi</Label>
              <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-1.5">
              <Label>Son Ödeme Tarihi</Label>
              <Input type="date" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Fatura Kalemi</Label>
            <div className="grid grid-cols-12 gap-2">
              <Input className="col-span-5" placeholder="Hizmet açıklaması" />
              <Input className="col-span-2" placeholder="Adet" type="number" value={qty} onChange={e => setQty(e.target.value)} defaultValue="1" />
              <Input className="col-span-5" placeholder="Birim fiyat" type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <Plus className="h-3 w-3" />Kalem Ekle
            </Button>
          </div>

          {/* KDV Oranı */}
          <div className="space-y-1.5">
            <Label>KDV Oranı</Label>
            <div className="flex gap-2">
              {[0, 1, 10, 20].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setKdvRate(rate)}
                  className={cn(
                    "flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors",
                    kdvRate === rate ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40"
                  )}
                >
                  %{rate}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">%0: KDV'siz · %1: Gıda/Tarım · %10: İnşaat/Sağlık · %20: Genel</p>
          </div>

          {/* Tutar özeti */}
          {net > 0 && (
            <div className="rounded-xl bg-muted/40 border p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span className="font-mono">{formatCurrency(net)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">KDV (%{kdvRate})</span>
                <span className="font-mono">{formatCurrency(kdv)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Toplam</span>
                <span className="font-mono">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Durum</Label>
            <Select defaultValue="draft">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="pending">Gönder (Bekliyor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
            <Button className="flex-1" onClick={() => { toast.success("Fatura oluşturuldu!"); onClose(); }}>
              Fatura Oluştur
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_FILTERS = ["Tümü", "paid", "pending", "overdue", "draft"] as const;
const STATUS_FILTER_LABELS: Record<string, string> = {
  "Tümü": "Tümü", paid: "Ödendi", pending: "Bekliyor", overdue: "Gecikmiş", draft: "Taslak",
};

export default function InvoicesPage(): React.JSX.Element {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tümü");
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch(() => toast.error("Faturalar yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => invoices.filter((inv) => {
    const matchSearch = inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Tümü" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  }), [invoices, search, statusFilter]);

  const totals = useMemo(() => ({
    paid:    invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
  }), [invoices]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => String(i.id))));
    }
  };

  const handleBulkPaid = () => {
    toast.success(`${selectedIds.size} fatura ödendi olarak işaretlendi!`);
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Faturalar</h1>
            <p className="text-muted-foreground text-sm mt-1">Fatura yönetimi ve takibi</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4" />Yeni Fatura
          </Button>
        </div>
      </BlurFade>

      {/* Stat Kartları */}
      <BlurFade delay={0.08} inView>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tahsil Edilen", value: totals.paid,    count: invoices.filter(i => i.status === "paid").length,    color: "text-emerald-600", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
            { label: "Bekleyen",     value: totals.pending,  count: invoices.filter(i => i.status === "pending").length,  color: "text-yellow-600",  icon: <Clock className="h-4 w-4 text-yellow-500" /> },
            { label: "Gecikmiş",     value: totals.overdue,  count: invoices.filter(i => i.status === "overdue").length,  color: "text-red-500",     icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
          ].map((item) => (
            <Card key={item.label} className={item.color === "text-red-500" && totals.overdue > 0 ? "border-red-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  {item.icon}
                </div>
                <p className={cn("text-xl font-bold font-mono tabular-nums", item.color)}>{formatCurrency(item.value)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.count} fatura</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </BlurFade>

      {/* Filtreler */}
      <BlurFade delay={0.15} inView>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Fatura veya müşteri ara..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  statusFilter === s ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {STATUS_FILTER_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* Tablo */}
      <BlurFade delay={0.2} inView>
        {/* Toplu İşlem Toolbar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-2.5 mb-3">
            <span className="text-sm font-medium">{selectedIds.size} fatura seçildi</span>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={handleBulkPaid}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Ödendi İşaretle
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { toast.info("PDF'ler hazırlanıyor..."); setSelectedIds(new Set()); }}>
                <Download className="h-3.5 w-3.5" />PDF İndir
              </Button>
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setSelectedIds(new Set())}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                  />
                </TableHead>
                {["Fatura No", "Müşteri", "Düzenlenme", "Son Ödeme", "Tutar", "Durum", ""].map((h) => (
                  <TableHead key={h} className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground", h === "Tutar" && "text-right")}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((inv) => {
                const cfg = STATUS_CONFIG[inv.status];
                const isOverdue = inv.status === "overdue";
                const isSelected = selectedIds.has(inv.id);
                return (
                  <TableRow
                    key={inv.id}
                    className={cn("cursor-pointer hover:bg-muted/30", isOverdue && "bg-red-50/30", isSelected && "bg-primary/5")}
                    onClick={() => setSelectedInv(inv)}
                  >
                    <TableCell onClick={(e) => { e.stopPropagation(); toggleSelect(inv.id); }}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                        checked={isSelected}
                        onChange={() => toggleSelect(inv.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                          {inv.clientName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{inv.clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                    <TableCell className={cn("text-sm", isOverdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
                      {formatDate(inv.dueDate)}
                      {isOverdue && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">Gecikmeli</span>}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm font-mono tabular-nums">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", cfg.className)}>
                        {cfg.icon}{cfg.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedInv(inv)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.success("PDF indiriliyor...")}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Fatura bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </BlurFade>

      {selectedInv && <InvoiceDetail inv={selectedInv} onClose={() => setSelectedInv(null)} />}
      <NewInvoiceDialog open={showNewDialog} onClose={() => setShowNewDialog(false)} />
    </div>
  );
}