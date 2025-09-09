"use client"

import { AppProvider } from "@/lib/providers/context/AppContext"

export function AppProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}









