"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface RegisterFormProps {
  onLogin?: () => void;
}

export function RegisterForm({ onLogin }: RegisterFormProps) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, companyName }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-white/70 text-sm">Şirket Adı</Label>
        <Input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Rusk Teknoloji A.Ş."
          required
          className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-white/70 text-sm">Ad Soyad</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ahmet Yılmaz"
          required
          className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/70 text-sm">E-posta</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@sirket.com"
          required
          className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/70 text-sm">Şifre</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="En az 8 karakter"
            required
            className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password.length > 0 && password.length < 8 && (
          <p className="text-xs text-yellow-500/70">{8 - password.length} karakter daha gerekli</p>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !companyName || !name || !email || password.length < 8}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hesap Oluştur"}
      </Button>

      <p className="text-center text-white/30 text-sm">
        Zaten hesabınız var mı?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Giriş yapın
        </button>
      </p>
    </form>
  );
}