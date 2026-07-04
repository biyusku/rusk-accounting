import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Rusk Muhasebe — Kurumsal Finans Yönetimi",
    template: "%s | Rusk Muhasebe",
  },
  description:
    "Türk işletmeleri için geliştirilmiş modern muhasebe uygulaması. Gelir/gider takibi, fatura yönetimi, banka entegrasyonu, FAST/EFT/Havale transferleri ve finansal raporlama.",
  keywords: [
    "muhasebe yazılımı",
    "fatura yönetimi",  
    "gelir gider takibi",
    "banka entegrasyonu",
    "FAST EFT havale",
    "finansal raporlama",
    "kurumsal muhasebe",
    "nakit akışı",
    "rusk muhasebe",
  ],
  authors: [{ name: "Rusk" }],
  creator: "Rusk",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: "Rusk Muhasebe — Kurumsal Finans Yönetimi",
    description:
      "Türk işletmeleri için geliştirilmiş modern muhasebe uygulaması. Gelir/gider takibi, fatura yönetimi, banka entegrasyonu ve finansal raporlama.",
    siteName: "Rusk Muhasebe",
    images: [{ url: "/screenshots/dashboard.png", width: 1440, height: 900, alt: "Rusk Muhasebe Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rusk Muhasebe — Kurumsal Finans Yönetimi",
    description: "Türk işletmeleri için geliştirilmiş modern muhasebe uygulaması.",
    images: ["/screenshots/dashboard.png"],
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      lang="tr"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground overflow-x-hidden font-sans">
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}