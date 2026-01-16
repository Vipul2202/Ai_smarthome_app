// apps/web/src/app/dashboard/layout.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { KitchenProvider } from "@/hooks/use-kitchen";
import { Header } from "@/app/dashboard/layout/Header";
import { MobileNav, type TabType } from "@/app/dashboard/layout/MobileNav";
import { DesktopSidebar } from "@/app/dashboard/layout/DesktopSidebar";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { HomeTab } from "@/app/dashboard/home/HomeTab";
import { InventoryTab } from "@/app/dashboard/inventory/InventoryTab";
import { ShoppingTab } from "@/app/dashboard/shopping/ShoppingTab";
import { ExpensesTab } from "@/app/dashboard/expenses/ExpensesTab";
import { RecipesTab } from "@/app/dashboard/recipes/RecipesTab";

// ---------------- TAB PATHS ---------------- //

const TAB_PATHS: Record<TabType, string> = {
  home: "/dashboard",
  inventory: "/dashboard/inventory",
  shopping: "/dashboard/shopping",
  expenses: "/dashboard/expenses",
  recipes: "/dashboard/recipes",
};

// ✔ Dynamic route friendly
function pathToTab(pathname: string): TabType {
  const p = pathname.split("?")[0].split("#")[0];
  if (p.startsWith("/dashboard/inventory")) return "inventory";
  if (p.startsWith("/dashboard/shopping")) return "shopping";
  if (p.startsWith("/dashboard/expenses")) return "expenses";
  if (p.startsWith("/dashboard/recipes")) return "recipes";
  return "home";
}

const TAB_ROUTES = new Set<string>(Object.values(TAB_PATHS));

// Breadcrumb nice names
const friendlyNameMap: Record<string, string> = {
  list: "List",
  details: "Details",
  add: "Create",
  edit: "Edit",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const mainRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>(() => pathToTab(pathname));
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [isTabRoute, setIsTabRoute] = useState(() =>
    TAB_ROUTES.has(pathname.split("?")[0].split("#")[0])
  );

  // ---------------- ROUTE HANDLING ---------------- //

  useEffect(() => {
    const p = pathname.split("?")[0].split("#")[0];
    const newTab = pathToTab(p);
    const newIsTabRoute = TAB_ROUTES.has(p);
    
    setActiveTab(newTab);
    setIsTabRoute(newIsTabRoute);
  }, [pathname]);

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);

    router.push(TAB_PATHS[tab], { scroll: false });

    // scroll top via ref (NO DOM query)
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- SCROLL HANDLING ---------------- //

  const handleScroll = () => {
    const target = mainRef.current;
    if (!target) return;

    setShowScrollTop(target.scrollTop > 120);
  };

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- CONTENT RENDER ---------------- //

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return <InventoryTab />;
      case "shopping":
        return <ShoppingTab />;
      case "expenses":
        return <ExpensesTab />;
      case "recipes":
        return <RecipesTab />;
      default:
        return <HomeTab />;
    }
  };

  // ---------------- BREADCRUMB ---------------- //

  const rawPath = pathname.split("?")[0].split("#")[0];
  const lastSegment = rawPath.split("/").slice(-1)[0];

  const secondaryLabel = isTabRoute
    ? activeTab
    : friendlyNameMap[lastSegment] ?? lastSegment.replace("-", " ");

  // ---------------- UI ---------------- //

  return (
    <ProtectedRoute>
      <KitchenProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">

      <Header />

      <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        <DesktopSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto scrollbar-hide relative"
          onScroll={handleScroll}
        >
          <div className="page-padding page-spacing section-spacing main-content mobile-bottom-safe dashboard-content px-2 sm:px-3 md:px-4">

            {/* BREADCRUMB */}
            <motion.div
              className="mb-3 sm:mb-4 md:mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 text-mobile-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                <span className="font-medium">Smart Kitchen</span>
                <span className="opacity-60">/</span>
                <span className="text-foreground font-semibold capitalize text-mobile-sm sm:text-base">
                  {secondaryLabel}
                </span>
              </div>
            </motion.div>

            {/* MAIN CONTENT WITH ANIMATION */}
            {isTabRoute ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="relative"
                >
                  <Suspense
                    fallback={
                      <div className="p-6 sm:p-8 text-mobile-sm sm:text-base opacity-70 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                        Loading...
                      </div>
                    }
                  >
                    {renderContent()}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="relative">
                <Suspense fallback={
                  <div className="p-6 sm:p-8 opacity-50 text-mobile-sm sm:text-base text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    Loading...
                  </div>
                }>
                  {children}
                </Suspense>
              </div>
            )}
          </div>

          {/* SCROLL TO TOP BUTTON */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:flex fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 text-white shadow-xl shadow-emerald-500/40 items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToTop}
              >
                <ArrowUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </KitchenProvider>
    </ProtectedRoute>
  );
}
