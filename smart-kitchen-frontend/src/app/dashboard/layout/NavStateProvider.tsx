// apps/web/src/app/dashboard/layout/NavStateProvider.tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import type { TabType } from "./MobileNav"

type Ctx = {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const NavStateContext = createContext<Ctx | null>(null)

function pathToTab(pathname: string): TabType {
  const p = pathname.split("?")[0].split("#")[0]
  if (p === "/dashboard/inventory") return "inventory"
  if (p === "/dashboard/shopping") return "shopping"
  if (p === "/dashboard/expenses") return "expenses"
  if (p === "/dashboard/recipes") return "recipes"
  return "home"
}

export function NavStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<TabType>(() => pathToTab(pathname))

  // keep in sync when URL changes (e.g. back/forward, direct link)
  useEffect(() => {
    setActiveTab(pathToTab(pathname))
  }, [pathname])

  return (
    <NavStateContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavStateContext.Provider>
  )
}

export function useNavState() {
  const ctx = useContext(NavStateContext)
  if (!ctx) throw new Error("useNavState must be used inside NavStateProvider")
  return ctx
}
