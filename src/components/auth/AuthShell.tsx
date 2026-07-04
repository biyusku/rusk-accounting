"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export type AuthView = "login" | "register";

const LEFT_CONTENT: Record<AuthView, { quote: string; steps: { step: string; text: string }[] }> = {
  login: {
    quote: "Tüm finansal verilerinizi tek panelde yönetin. Gerçek zamanlı bakiyeler, işlemler ve raporlar.",
    steps: [
      { step: "1", text: "Hesabınıza giriş yapın" },
      { step: "2", text: "Finansal durumunuzu görün" },
      { step: "3", text: "Akıllı kararlar alın" },
    ],
  },
  register: {
    quote: "Rusk Muhasebe ile finansal kontrolü elinize alın. Hesaplar, faturalar, bütçe — hepsi bir arada.",
    steps: [
      { step: "1", text: "Hesabınızı oluşturun" },
      { step: "2", text: "Verilerinizi bağlayın" },
      { step: "3", text: "Yönetmeye başlayın" },
    ],
  },
};

export function AuthShell() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<AuthView>("login");

  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "register") setView("register");
  }, [searchParams]);

  const content = LEFT_CONTENT[view];

  return (
    <main className="flex min-h-screen bg-[#0f0f10]">
      {/* Sol Panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 border-r border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-white/60 text-sm font-semibold tracking-widest uppercase">Rusk Muhasebe</span>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={view + "-quote"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-white/80 text-xl font-medium leading-relaxed max-w-sm"
            >
              {content.quote}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={view + "-steps"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {content.steps.map((s) => (
                <div key={s.step} className="flex items-center gap-4">
                  <div className="h-7 w-7 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-white/40 text-xs font-bold">{s.step}</span>
                  </div>
                  <span className="text-white/50 text-sm">{s.text}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div>
          <p className="text-white/20 text-xs">© 2026 Rusk Muhasebe. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Sağ Panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobil logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-white/60 text-sm font-semibold tracking-widest uppercase">Rusk Muhasebe</span>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.h1
                key={view + "-title"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-white text-2xl font-bold tracking-tight"
              >
                {view === "login" ? "Giriş Yap" : "Hesap Oluştur"}
              </motion.h1>
            </AnimatePresence>
            <p className="text-white/40 text-sm mt-1">
              {view === "login"
                ? "Finansal panelinize erişin"
                : "Ücretsiz hesabınızı oluşturun"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {view === "login" ? (
                <LoginForm onRegister={() => setView("register")} />
              ) : (
                <RegisterForm onLogin={() => setView("login")} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}