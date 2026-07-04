"use client";

/**
 * Admin kullanıcı yönetim popup'ı.
 * Sadece admin rolündeki kullanıcılara gösterilir.
 */
import { useState, useEffect, FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Trash2, Shield, Eye, UserCog, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS, type UserRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-3 w-3" />,
  manager: <TrendingUp className="h-3 w-3" />,
  accountant: <UserCog className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-500/10 text-red-400 border-red-500/20",
  manager: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accountant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  viewer: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("viewer");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as UserRecord[];
      setUsers(data);
    } catch {
      toast.error("Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchUsers();
  }, [open]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (formPassword.length < 8) {
      toast.error("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, password: formPassword, role: formRole }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Kullanıcı oluşturulamadı.");
        return;
      }
      toast.success("Kullanıcı oluşturuldu.");
      setFormName(""); setFormEmail(""); setFormPassword(""); setFormRole("viewer");
      setShowForm(false);
      await fetchUsers();
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast.success("Rol güncellendi.");
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } catch {
      toast.error("Rol güncellenemedi.");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(isActive ? "Kullanıcı devre dışı bırakıldı." : "Kullanıcı aktifleştirildi.");
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !isActive } : u));
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Kullanıcı silindi.");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      toast.error("Kullanıcı silinemedi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Kullanıcı Yönetimi
          </DialogTitle>
          <DialogDescription>
            Şirket çalışanlarını yönetin, rol ve erişim hakları belirleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowForm((v) => !v)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500"
            >
              <UserPlus className="h-4 w-4" />
              Yeni Kullanıcı
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="border rounded-xl p-4 space-y-4 bg-muted/30">
              <p className="text-sm font-semibold">Yeni Kullanıcı Ekle</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="f-name" className="text-xs">Ad Soyad</Label>
                  <Input id="f-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ali Veli" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="f-email" className="text-xs">E-posta</Label>
                  <Input id="f-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="ali@sirket.com" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="f-password" className="text-xs">Şifre</Label>
                  <Input id="f-password" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="En az 8 karakter" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rol</Label>
                  <Select value={formRole} onValueChange={(v) => setFormRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["admin", "manager", "accountant", "viewer"] as UserRole[]).map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>İptal</Button>
                <Button type="submit" size="sm" disabled={formLoading}>
                  {formLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Oluştur"}
                </Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    !user.isActive && "opacity-50"
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {(user.name ?? user.email)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge className={cn("gap-1 text-xs border", ROLE_COLORS[user.role])}>
                    {ROLE_ICONS[user.role]}
                    {ROLE_LABELS[user.role]}
                  </Badge>
                  <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}>
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["admin", "manager", "accountant", "viewer"] as UserRole[]).map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    title={user.isActive ? "Devre dışı bırak" : "Aktifleştir"}
                  >
                    {user.isActive ? "⏸" : "▶"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive/60 hover:text-destructive"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}