// InventoryTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Package,
  TrendingUp,
  AlertCircle,
  Camera,
  Upload,
  Package as PackageIcon,
  LayoutGrid,
  List,
  RotateCcw,
  CheckSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { useInventory } from "@/hooks/use-inventory";
import { AddItemDialog } from "./AddItemDialog";
import { ScanItemDialog } from "./ScanItemDialog";
import { ItemEditDialog } from "./ItemEditDialog";
import { useRouter } from "next/navigation";

import { recalcInventory } from "./inventory-utils";
import type { NormalizedItem as InventoryItem } from "./types";
import type { SuggestedItem } from "./types";
import { useHapticFeedback } from "@/lib/haptics";

import { QuickAddDialog } from "./components/QuickAddDialog";
import { BulkUploadDialog } from "./components/BulkUploadDialog";
import { InventoryCard } from "./components/InventoryCard";
import { ItemDetailsModal } from "./components/ItemDetailsModal";
import { FiltersDrawer } from "./components/FiltersDrawer";
import { useFilters } from "./hooks/useFilters";

import {
  getSmartSuggestionsLocal,
  type SmartSuggestions,
} from "./inventory-utils/smart-suggestions";
import {
  exportInventoryJSON,
  parseImportedInventoryJSON,
} from "./inventory-utils/import-export";

import { SmartSuggestionsPanel } from "./components/SmartSuggestionsPanel";
import { ImportExportBar } from "./components/ImportExportBar";
import { smartPredict } from "./inventory-utils/smart-ai";

type SortOption = "expiry" | "qtyAsc" | "qtyDesc" | "name" | "heat";

// Helper function to get emoji for item names
function emojiForName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("rice")) return "🌾";
  if (
    lower.includes("milk") ||
    lower.includes("yogurt") ||
    lower.includes("curd")
  )
    return "🥛";
  if (lower.includes("tomato")) return "🍅";
  if (lower.includes("onion")) return "🧅";
  if (lower.includes("chicken")) return "🍗";
  if (lower.includes("butter") || lower.includes("ghee")) return "🧈";
  if (lower.includes("sugar")) return "🍬";
  if (lower.includes("tea")) return "🍵";
  if (lower.includes("oil")) return "🛢️";
  return "🥫";
}

export function InventoryTab() {
  const router = useRouter();
  const { items: inventoryData, loading, error } = useInventory();
  const haptic = useHapticFeedback();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("expiry");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const [items, setItems] = useState<InventoryItem[]>([]);

  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const [globalLowThreshold, setGlobalLowThreshold] = useState<number>(1);
  const [suggestedItem, setSuggestedItem] = useState<SuggestedItem | null>(
    null
  );
  const [undoStack, setUndoStack] = useState<InventoryItem[][]>([]);
  const [redoStack, setRedoStack] = useState<InventoryItem[][]>([]);
  const { filters, setFilters, resetFilters } = useFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // All useMemo and useEffect hooks must be declared before any early returns
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Quick toggles
      if (filters.lowStock && item.status !== "low") return false;
      if (filters.expiringSoon && item.status !== "expiring") return false;
      if (filters.expired && item.status !== "expired") return false;

      // Category
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(item.category)
      )
        return false;

      // Location
      if (
        filters.locations.length > 0 &&
        !filters.locations.includes(item.location)
      )
        return false;

      // Tags
      if (filters.tags.length > 0) {
        const hasAny = item.tags?.some((t) => filters.tags.includes(t));
        if (!hasAny) return false;
      }

      const heat = item.heatScore ?? 0;
      if (heat < filters.heatRange[0] || heat > filters.heatRange[1])
        return false;

      return true; // Changed from false to true - this was likely a bug
    });
  }, [items, filters]);

  const smartSuggestions: SmartSuggestions = useMemo(
    () => getSmartSuggestionsLocal(items, globalLowThreshold),
    [items, globalLowThreshold]
  );

  // Load from GraphQL API instead of localStorage
  useEffect(() => {
    if (inventoryData && inventoryData.length > 0) {
      // Transform GraphQL data to match local format
      const transformedItems = inventoryData.map((item: any) => ({
        id: item.id,
        name: item.name,
        qty: item.totalQuantity || 0,
        unit: item.defaultUnit || 'pcs',
        category: item.category || 'Other',
        location: item.location || 'Pantry',
        expiry: item.nextExpiry || null,
        status: item.status?.toLowerCase() || 'ok',
        img: item.imageUrl || emojiForName(item.name),
        addedAt: new Date(item.createdAt).getTime(),
        updatedAt: item.updatedAt,
        lowThreshold: item.threshold || 1,
        notes: '',
        tags: item.tags || [],
        heatScore: 0,
        heatColor: 'green',
        history: [],
      }));
      
      setItems(recalcInventory(transformedItems, globalLowThreshold));
    }
  }, [inventoryData?.length, globalLowThreshold]);

  useEffect(() => {
    localStorage.setItem("globalLowThreshold", String(globalLowThreshold));
  }, [globalLowThreshold]);

  useEffect(() => {
    setItems((prev) => recalcInventory(prev, globalLowThreshold));
  }, [globalLowThreshold]);

  // Load global threshold
  useEffect(() => {
    try {
      const stored = localStorage.getItem("globalLowThreshold");
      if (stored) {
        setGlobalLowThreshold(Number(stored));
      }
    } catch (err) {}
  }, []);

  // Early returns after all hooks are declared
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto mb-2" />
          <p className="text-[10px] sm:text-sm text-muted-foreground">Failed to load inventory</p>
          <Button className="mt-2" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }



  const categories = [
    "All",
    ...Array.from(
      new Set(
        items
          .map((i) => i.category)
          .filter((c): c is string => !!c && c.trim().length > 0)
      )
    ),
  ];

  const locations = ["All", "Fridge", "Freezer", "Pantry", "Counter"];

  const availableTags = Array.from(
    new Set(items.flatMap(item => item.tags || []))
  ).filter(Boolean);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSortBy("expiry");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setMultiSelectMode(false);
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Remove ${selectedIds.length} item${
          selectedIds.length > 1 ? "s" : ""
        } from inventory?`
      )
    )
      return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    clearSelection();
  };



  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "expiry": {
        const aTime = a.expiry ? new Date(a.expiry).getTime() : Infinity;
        const bTime = b.expiry ? new Date(b.expiry).getTime() : Infinity;
        return aTime - bTime;
      }
      case "qtyAsc":
        return a.qty - b.qty;
      case "qtyDesc":
        return b.qty - a.qty;
      case "name":
        return a.name.localeCompare(b.name);
      case "heat":
        return (b.heatScore ?? 0) - (a.heatScore ?? 0);
      default:
        return 0;
    }
  });

  const stats = {
    total: items.length,
    low: items.filter((i) => i.status === "low").length,
    expiring: items.filter(
      (i) => i.status === "expiring" || i.status === "expired"
    ).length,
    fridge: items.filter((i) => i.location === "Fridge").length,
  };

  const handleCardClick = (id: string) => {
    if (multiSelectMode) {
      toggleSelect(id);
    } else {
      const item = items.find((x) => x.id === id) || null;
      setSelectedItem(item);
      setDetailsOpen(true);
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditItem(item);
    setIsEditOpen(true);
  };



  // Central helper with undo/redo
  const updateItems = (updater: (prev: InventoryItem[]) => InventoryItem[]) => {
    setItems((prev) => {
      const next = updater(prev);

      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setUndoStack((u) => [...u, prev]);
        setRedoStack([]);
      }

      return recalcInventory(next, globalLowThreshold);
    });
  };

  const handleUseSuggestion = (aiName: string) => {
    const suggestion = {
      name: aiName,
      qty: "1",
      unit: "pcs",
      location: "Fridge",
      expiry: new Date().toISOString().slice(0, 10),
      category: "Pantry",
    };

    setSuggestedItem(suggestion);
    setSelectedItem(null);
    setDetailsOpen(false);

    setIsScanDialogOpen(false);
    setIsAddDialogOpen(true);
  };

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const handleUndo = () => {
    if (!canUndo) return;

    setItems((current) => {
      const prev = undoStack[undoStack.length - 1];
      setUndoStack((s) => s.slice(0, -1));
      setRedoStack((r) => [...r, current]);
      return recalcInventory(prev, globalLowThreshold);
    });
  };

  const handleRedo = () => {
    if (!canRedo) return;

    setItems((current) => {
      const next = redoStack[redoStack.length - 1];
      setRedoStack((s) => s.slice(0, -1));
      setUndoStack((u) => [...u, current]);
      return recalcInventory(next, globalLowThreshold);
    });
  };



  // ---- IMPORT / EXPORT HANDLERS ----
  const handleExportJSON = () => {
    const json = exportInventoryJSON(items);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kitchen-inventory-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSONText = (text: string) => {
    try {
      const imported = parseImportedInventoryJSON(text);
      if (!imported.length) return;

      updateItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const normalized = imported.map((i, idx) => ({
          ...i,
          id: existingIds.has(i.id)
            ? `imported-${Date.now()}-${idx}`
            : (i.id ?? `imported-${Date.now()}-${idx}`),
        }));
        return [...prev, ...normalized];
      });

      alert(`Imported ${imported.length} items`);
    } catch (err) {
      console.error(err);
      alert("Failed to import JSON. Please check the format.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="section-spacing bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Title Section */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-mobile-xl sm:text-2xl font-bold">Kitchen Inventory</h2>
            </div>
            <p className="text-mobile-sm sm:text-base text-muted-foreground">
              Track your pantry items and expiry dates
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Import/Export Row */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="flex-1 sm:flex-none h-10 sm:h-11 text-mobile-sm sm:text-sm font-medium"
            >
              <span className="mr-2">📤</span>
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const text = e.target?.result as string;
                      handleImportJSONText(text);
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              className="flex-1 sm:flex-none h-10 sm:h-11 text-mobile-sm sm:text-sm font-medium"
            >
              <span className="mr-2">📥</span>
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className="flex-1 sm:flex-none h-10 sm:h-11 text-mobile-sm sm:text-sm font-medium"
            >
              <span className="mr-2">🔍</span>
              Filters
            </Button>
          </div>

          {/* Main Actions Row */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              size="sm"
              onClick={() => {
                haptic.light();
                setIsAddDialogOpen(true);
              }}
              className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              <span className="text-mobile-base sm:text-lg font-semibold">Add Item</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  Total Items
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/25">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  Low Stock
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.low}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/25">
                  <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  Expiring
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.expiring}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-md shadow-blue-500/25 text-2xl sm:text-3xl">
                  🧊
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  In Fridge
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.fridge}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Smart Suggestions (local, rule-based) */}
      <SmartSuggestionsPanel
        suggestions={smartSuggestions}
        onClickLowStock={() => {
          setSelectedCategory("All");
          setSelectedLocation("All");
          setSortBy("qtyAsc");
        }}
        onClickExpiringSoon={() => {
          setSortBy("expiry");
        }}
        onClickRecommended={() => {
          setViewMode("list");
          setSortBy("heat");
        }}
      />

      {/* Quick Actions: Scan + Add + Bulk */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            onClick={() => {
              haptic.medium();
              setIsScanDialogOpen(true);
            }}
            className="w-full overflow-hidden relative bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm cursor-pointer group hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
          >
            <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  Scan Items
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100">
                  AI detects name, qty, expiry from photo
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div
            onClick={() => {
              haptic.light();
              setIsQuickAddOpen(true);
            }}
            className="w-full overflow-hidden relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm cursor-pointer group hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
          >
            <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  Quick Add
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100">
                  Manually add single item
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            onClick={() => {
              haptic.medium();
              setIsBulkDialogOpen(true);
            }}
            className="w-full overflow-hidden relative bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm cursor-pointer group hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
          >
            <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  Bulk Upload
                </h3>
                <p className="text-xs sm:text-sm text-orange-100">
                  Upload receipt or inventory photo
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters Section */}
      <div className="section-spacing">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          <input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 h-9 sm:h-11 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/60 rounded-lg sm:rounded-xl shadow-lg shadow-slate-900/5 dark:shadow-black/20 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-[10px] sm:text-sm backdrop-blur-xl"
          />
        </div>

        {/* Mobile-Friendly Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Mobile Filter Button */}
          <div className="sm:hidden">
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(true)}
              className="w-full h-11 justify-between text-mobile-sm"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Filters & Sort
              </span>
              <span className="text-xs text-muted-foreground">
                {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) ? 'Active' : 'None'}
              </span>
            </Button>
          </div>

          {/* Desktop Filter Controls */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 flex-1">
            {/* Location Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/60 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm backdrop-blur-xl shadow-sm"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "All"
                      ? "All Locations"
                      : loc === "Fridge"
                        ? "🧊 Fridge"
                        : loc === "Freezer"
                          ? "❄️ Freezer"
                          : loc === "Pantry"
                            ? "📦 Pantry"
                            : "🛋️ Counter"}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-10 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/60 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm backdrop-blur-xl shadow-sm"
              >
                <option value="expiry">Expiry (soonest)</option>
                <option value="qtyAsc">Quantity: low → high</option>
                <option value="qtyDesc">Quantity: high → low</option>
                <option value="name">Name A → Z</option>
                <option value="heat">Heat Index (high → low)</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                View
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-10 text-sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-10 text-sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Actions
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={multiSelectMode ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-10 text-sm"
                  onClick={() => setMultiSelectMode((prev) => !prev)}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3"
                  onClick={handleResetFilters}
                  title="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
                className={
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg shrink-0 h-10 sm:h-11 px-4 sm:px-5 text-mobile-sm sm:text-base font-semibold"
                    : "shrink-0 h-10 sm:h-11 px-4 sm:px-5 text-mobile-sm sm:text-base border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 backdrop-blur-xl shadow-sm hover:shadow-md transition-all"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </div>
      </div>

      {/* Multi-select toolbar */}
      {selectedIds.length > 0 && (
        <div className="w-full overflow-hidden relative bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-white">
              <span className="font-bold text-sm">
                {selectedIds.length} item
                {selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <span className="text-amber-100 ml-2 text-sm">
                You can remove them in one go.
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="mobile-btn flex-1 sm:flex-none bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30" 
                onClick={clearSelection}
              >
                Clear
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="mobile-btn flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white" 
                onClick={deleteSelected}
              >
                Remove selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid / List */}
      {sortedItems.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
              : "section-spacing"
          }
        >
          {sortedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <InventoryCard
                item={item}
                isSelected={selectedIds.includes(item.id)}
                viewMode={viewMode}
                onClick={() => handleCardClick(item.id)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="mobile-card sm:bg-white sm:dark:bg-slate-900 sm:border sm:border-gray-200/40 sm:dark:border-slate-700/40">
          <CardContent className="card-content-padding section-spacing">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
              <PackageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm md:text-base lg:text-lg mobile-text-sm font-semibold mb-1">No items found</p>
              <p className="text-xs mobile-text-xs text-muted-foreground">
                Try adjusting your search or filters — or add items to your
                inventory.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-1">
              <Button size="sm" className="mobile-btn-sm" onClick={() => router.push("/dashboard/inventory/add")}>
                <Plus className="w-3 h-3 mr-1" />
                Add Item
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="mobile-btn-sm"
                onClick={() => setIsScanDialogOpen(true)}
              >
                <Camera className="w-3 h-3 mr-1" />
                Scan Items
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="mobile-btn-sm"
                onClick={() => setIsBulkDialogOpen(true)}
              >
                <Upload className="w-3 h-3 mr-1" />
                Bulk Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ScanItemDialog
        isOpen={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
        onUseSuggestion={(aiName) => handleUseSuggestion(aiName)}
      />
      <AddItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setSuggestedItem(null); // optional but recommended
        }}
        suggestedItem={suggestedItem}
        onAdd={(raw) => {
          updateItems((prev) => {
            const created: InventoryItem = {
              id: "item-" + crypto.randomUUID(),
              name: raw.name,
              qty: raw.quantity,
              unit: raw.unit,
              category: raw.category || "Pantry",
              location: raw.location || "Pantry",
              expiry: raw.expiryDate,
              img: raw.emoji,
              status: "ok",
              addedAt: Date.now(),
              updatedAt: new Date().toISOString(),
              lowThreshold: undefined,
              notes: "",
              tags: [],
              heatScore: 0,
              heatColor: "green",
              history: [
                {
                  date: new Date().toISOString(),
                  action: "added",
                  qty: raw.quantity,
                  location: raw.location || "Pantry",
                },
              ],
            };

            return [...prev, created];
          });
        }}
      />
      <QuickAddDialog
        open={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAdd={(raw) => {
          // Auto prediction using the full form object
          const auto = smartPredict({
            name: raw.name,
            quantity: Number(raw.qty),
            unit: raw.unit,
            category: raw.category,
            location: raw.location,
          });

          updateItems((prev) => {
            const created: InventoryItem = {
              id: "quick-" + crypto.randomUUID(),
              name: raw.name,
              qty: Number(raw.qty),
              unit: auto.unit, // ← AI improved
              category: auto.category, // ← AI improved
              location: auto.location, // ← AI improved
              expiry: auto.expiry, // ← AI improved
              img: auto.emoji, // ← AI improved

              status: "ok",
              addedAt: Date.now(),
              updatedAt: new Date().toISOString(),
              lowThreshold: undefined,
              notes: "",
              tags: [],
              heatScore: 0,
              heatColor: "green",

              history: [
                {
                  date: new Date().toISOString(),
                  action: "quick-added",
                  qty: Number(raw.qty),
                  location: auto.location,
                },
              ],
            };

            return [...prev, created];
          });

          setIsQuickAddOpen(false);
        }}
      />

      <BulkUploadDialog
        open={isBulkDialogOpen}
        onClose={() => setIsBulkDialogOpen(false)}
        onApply={(rows) => {
          updateItems((prev) => {
            const next = [...prev];

            for (const row of rows) {
              const idx = next.findIndex(
                (it) =>
                  it.name.trim().toLowerCase() ===
                    row.name.trim().toLowerCase() &&
                  it.location === row.location
              );

              if (idx !== -1) {
                const existing = next[idx];
                next[idx] = {
                  ...existing,
                  qty: existing.qty + Number(row.qty || 0),
                  expiry:
                    row.expiry > existing.expiry ? row.expiry : existing.expiry,
                  updatedAt: new Date().toISOString(),
                  heatScore: existing.heatScore ?? 0,
                  heatColor: existing.heatColor ?? "green",
                  history: [
                    {
                      date: new Date().toISOString(),
                      action: "updated",
                      qty: row.qty,
                      location: row.location,
                    },
                    ...(existing.history?.slice(0, 4) ?? []),
                  ],
                };
              } else {
                next.push({
                  id: `bulk-${next.length + 1}`,
                  name: row.name,
                  qty: Number(row.qty || 0),
                  unit: row.unit,
                  category: "Pantry",
                  location: row.location,
                  expiry: row.expiry,
                  img: emojiForName(row.name),
                  status: "ok",
                  addedAt: Date.now(),
                  lowThreshold: undefined,
                  notes: "",
                  tags: [],
                  updatedAt: new Date().toISOString(),
                  heatScore: 0,
                  heatColor: "green",
                  history: [
                    {
                      date: new Date().toISOString(),
                      action: "bulk-added",
                      qty: row.qty,
                      location: row.location,
                    },
                  ],
                });
              }
            }

            return next;
          });
        }}
      />
      <ItemDetailsModal
        item={selectedItem}
        open={detailsOpen}
        globalLowThreshold={globalLowThreshold}
        onClose={() => setDetailsOpen(false)}
        onEdit={() => {
          setDetailsOpen(false);
          if (selectedItem) startEditing(selectedItem);
        }}
      />

      <ItemEditDialog
        key={editItem?.id ?? "empty"}
        open={isEditOpen}
        item={editItem}
        onClose={() => setIsEditOpen(false)}
        onSave={(updated) => {
          updateItems((prev) =>
            prev.map((i) =>
              i.id === updated.id
                ? {
                    ...i,
                    ...updated,
                    img: updated.img ?? emojiForName(updated.name),
                  }
                : i
            )
          );
          setIsEditOpen(false);
          setDetailsOpen(false);
        }}
      />

      {/* Mobile Filters Drawer */}
      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        categories={categories}
        locations={locations}
        availableTags={availableTags}
        matchCount={filteredItems.length}
      />
    </motion.div>
  );
}
