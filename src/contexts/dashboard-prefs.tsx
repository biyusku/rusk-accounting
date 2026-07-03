"use client";

import { createContext, useContext, useState, useEffect } from "react";

export interface DashboardPrefs {
  showCurrencyMarquee: boolean;
  showKPICards: boolean;
  showTransactionsFeed: boolean;
  showQuickActions: boolean;
  showAccountBalances: boolean;
  showInvoiceStatus: boolean;
  showBudgetMini: boolean;
  showAccountsOverview: boolean;
}

const DEFAULT_PREFS: DashboardPrefs = {
  showCurrencyMarquee: true,
  showKPICards: true,
  showTransactionsFeed: true,
  showQuickActions: true,
  showAccountBalances: true,
  showInvoiceStatus: true,
  showBudgetMini: true,
  showAccountsOverview: true,
};

const STORAGE_KEY = "rusk-dashboard-prefs";

interface DashboardPrefsContextValue {
  prefs: DashboardPrefs;
  setPref: (key: keyof DashboardPrefs, value: boolean) => void;
}

const DashboardPrefsContext = createContext<DashboardPrefsContextValue>({
  prefs: DEFAULT_PREFS,
  setPref: () => {},
});

export function DashboardPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<DashboardPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const setPref = (key: keyof DashboardPrefs, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <DashboardPrefsContext.Provider value={{ prefs, setPref }}>
      {children}
    </DashboardPrefsContext.Provider>
  );
}

export function useDashboardPrefs() {
  return useContext(DashboardPrefsContext);
}