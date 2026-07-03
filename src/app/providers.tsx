"use client";

import { ThemeProvider } from "next-themes";
import { DashboardPrefsProvider } from "@/contexts/dashboard-prefs";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <DashboardPrefsProvider>
        {children}
      </DashboardPrefsProvider>
    </ThemeProvider>
  );
}