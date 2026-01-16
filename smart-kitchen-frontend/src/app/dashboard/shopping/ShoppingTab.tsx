"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Check,
  Trash2,
  ShoppingCart,
  ListChecks,
  Sparkles,
  Calendar,
  TrendingDown,
  Package,
  ArrowRight,
  Flame,
  AlertCircle,
  Droplets,
  FlagOff,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useShoppingLists, useShoppingList } from "@/hooks/use-shopping";
import React, { useState } from "react";
import { ScheduleDialog } from "./AddScheduleDialog";
import { AddListDialog } from "./AddListDialog";
import { useHapticFeedback } from "@/lib/haptics";
import { ShoppingSkeleton } from "@/components/skeleton-loaders";

interface ShoppingListItem {
  id: string
  name: string
  quantity: number
  unit?: string
  linkedItemId?: string
  isPurchased: boolean
  price?: number
  notes?: string
  createdAt: string
}
import {
  AddShoppingItemDialog,
  type NewShoppingItem,
} from "./AddShoppingItemDialog";
import { VoiceInput } from '@/components/voice/VoiceInput';

type TabId = "weekly" | "festival" | "kitchen";

const festivalTemplateData: Record<
  string,
  { name: string; qty?: string; estimatedPrice?: number }[]
> = {
  "Diwali Shopping": [
    { name: "Ghee", qty: "1L", estimatedPrice: 600 },
    { name: "Dry Fruits", qty: "500g", estimatedPrice: 800 },
    { name: "Sugar", qty: "5kg", estimatedPrice: 250 },
    { name: "Oil", qty: "5L", estimatedPrice: 700 },
    { name: "Flour", qty: "10kg", estimatedPrice: 450 },
  ],
  "Christmas Grocery": [
    { name: "Cake Mix", qty: "2 packs", estimatedPrice: 320 },
    { name: "Chocolate", qty: "1kg", estimatedPrice: 500 },
    { name: "Fruits", qty: "3kg", estimatedPrice: 250 },
    { name: "Wine", qty: "2 bottles", estimatedPrice: 1300 },
  ],
  "Eid Essentials": [
    { name: "Dates", qty: "1kg", estimatedPrice: 420 },
    { name: "Mutton", qty: "3kg", estimatedPrice: 1600 },
    { name: "Rice", qty: "10kg", estimatedPrice: 820 },
    { name: "Vermicelli", qty: "500g", estimatedPrice: 90 },
  ],
  "Holi Special": [
    { name: "Thandai Mix", qty: "500g", estimatedPrice: 260 },
    { name: "Gujiya", qty: "2kg", estimatedPrice: 450 },
    { name: "Colors", qty: "5 packs", estimatedPrice: 320 },
  ],
};

export function ShoppingTab() {
  const haptic = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<TabId>("weekly");
  const [query, setQuery] = useState("");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentListName, setCurrentListName] = useState("Weekly Shopping");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isNewListOpen, setIsNewListOpen] = useState(false);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  const { lists, loading: listsLoading, error: listsError, generateAutoList } = useShoppingLists();
  const { 
    list: currentList, 
    items, 
    loading: itemsLoading, 
    error: itemsError,
    addItem,
    toggleItem,
    removeItem: deleteItem 
  } = useShoppingList(currentListId || '');

  // Use first list as default if available
  React.useEffect(() => {
    if (lists.length > 0 && !currentListId) {
      setCurrentListId(lists[0].id);
      setCurrentListName(lists[0].title);
    }
  }, [lists, currentListId]);

  // Early returns after all hooks are declared
  if (listsLoading || itemsLoading) {
    return <ShoppingSkeleton />
  }

  if (listsError || itemsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-[10px] sm:text-sm text-muted-foreground">Failed to load shopping lists</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 h-7 text-xs sm:text-sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const loadTemplate = (templateName: string) => {
    const templateItems = festivalTemplateData[templateName];
    if (!templateItems) return;

    setActiveTab("festival");
    setSelectedTemplate(templateName);

    // TODO: Add template items to current shopping list via API
    console.log('Loading template:', templateName, templateItems);
  };

  const handleKitchenAlertClick = (type: string) => {
    const label =
      type === "urgent"
        ? "Gas cylinder"
        : type === "warning"
          ? "Water filter"
          : "Chimney service";

    const ok = window.confirm(`Open Kitchen Alerts and review "${label}" now?`);

    if (!ok) return;

    // user ne confirm kiya → abhi ke लिए sirf tab switch
    setActiveTab("kitchen");
  };

  const handleAutoGenerate = async () => {
    setAutoGenerating(true);
    haptic.medium();

    try {
      const newList = await generateAutoList('WEEKLY');
      if (newList) {
        haptic.success();
        // Optionally switch to the new list
        setCurrentListId(newList.id);
      }
    } catch (error) {
      console.error('Failed to generate auto list:', error);
      haptic.error();
      // Show user-friendly error message
      alert('Failed to generate shopping list. Please try again.');
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleToggleItem = async (id: string) => {
    const item = (items as ShoppingListItem[]).find((i: ShoppingListItem) => i.id === id);
    if (item) {
      await toggleItem(id, !item.isPurchased);
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
  };

  const handleVoiceCommand = async (command: any) => {
    haptic.success();
    if (command.action === 'add_to_shopping' && command.item) {
      await addItem({
        name: command.item,
        quantity: command.quantity || 1,
        price: 0,
      });
    }
  };

  const totalCost = (items as ShoppingListItem[]).reduce(
    (sum: number, item: ShoppingListItem) => sum + (item.price ?? 0),
    0
  );

  const completedCount = (items as ShoppingListItem[]).filter((item: ShoppingListItem) => item.isPurchased).length;
  const progress = items.length ? (completedCount / items.length) * 100 : 0;
  const remainingItems = items.length - completedCount;

  const festivalTemplates = [
    { name: "Diwali Shopping", icon: "🪔", items: 28, color: "bg-orange-500" },
    { name: "Christmas Grocery", icon: "🎄", items: 22, color: "bg-red-500" },
    { name: "Eid Essentials", icon: "🌙", items: 35, color: "bg-green-500" },
    { name: "Holi Special", icon: "🎉", items: 18, color: "bg-purple-500" },
  ];

  const kitchenReminders = [
    {
      title: "Gas Cylinder Low",
      icon: Flame,
      status: "urgent",
      color: "bg-red-500 text-red-100",
    },
    {
      title: "Water Filter Change",
      icon: Droplets,
      status: "warning",
      color: "bg-amber-500 text-amber-100",
    },
    {
      title: "Chimney Service Due",
      icon: FlagOff,
      status: "info",
      color: "bg-blue-500 text-blue-100",
    },
  ];

  const filteredItems = (items as ShoppingListItem[]).filter((item: ShoppingListItem) => {
    if (!query.trim()) return true; // Show all items if no search query
    return item.name.toLowerCase().includes(query.toLowerCase().trim());
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-mobile-xl sm:text-2xl font-bold tracking-tight">Shopping Lists</h2>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-mobile-sm sm:text-base text-muted-foreground">
              Smart lists with festival templates & kitchen reminders
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Filter input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Filter items..."
              className="w-full h-12 sm:h-14 pl-14 pr-12 rounded-xl border border-input bg-background/50 backdrop-blur-sm text-mobile-base sm:text-lg font-medium
                placeholder:text-muted-foreground/60
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
                focus-visible:border-emerald-500/50 focus-visible:bg-background
                transition-all duration-200 shadow-sm hover:shadow-md
                text-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors z-10"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                haptic.light();
                setIsScheduleOpen(true);
              }}
              className="h-11 sm:h-12 text-mobile-sm sm:text-base"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Schedule
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-11 sm:h-12 text-mobile-sm sm:text-base border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400
                hover:bg-purple-500/20 hover:border-purple-500/30"
              onClick={() => {
                haptic.light();
                setShowVoiceInput(true);
              }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Voice
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-11 sm:h-12 text-mobile-sm sm:text-base border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
                hover:bg-emerald-500/20 hover:border-emerald-500/30"
              onClick={handleAutoGenerate}
              disabled={autoGenerating}
            >
              {autoGenerating ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              )}
              Auto
            </Button>

            <Button
              size="sm"
              onClick={() => {
                haptic.medium();
                setIsNewListOpen(true);
              }}
              className="h-11 sm:h-12 text-mobile-sm sm:text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              New List
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
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  Total Items
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold">{items.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  Completed
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedCount}
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
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <ListChecks className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  Remaining
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {remainingItems}
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
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-2xl sm:text-3xl">
                  💰
                </div>
                <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                  Total Cost
                </p>
                <p className="text-mobile-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                  ₹{totalCost.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Layout - Mobile First Responsive */}
      <div className="space-y-4 sm:space-y-6">
        {/* Active Shopping List - Always visible */}
        <div className="space-y-4">
          {/* List Tab Switcher */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardContent className="p-4">
              <div className="flex bg-muted/50 rounded-xl p-2 mb-4 w-full gap-2">
                {[
                  { id: "weekly" as TabId, label: "Weekly", icon: "🛒" },
                  { id: "festival" as TabId, label: "Festival", icon: "🪔" },
                  {
                    id: "kitchen" as TabId,
                    label: "Kitchen",
                    icon: "🔧",
                  },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isFestivalSelected =
                    tab.id === "festival" && !!selectedTemplate;

                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      size="sm"
                      data-active={isActive}
                      className={[
                        "flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg",
                        "h-9 sm:h-10 text-xs sm:text-sm font-medium transition-all",
                        "px-3 sm:px-4 min-w-0",
                        isActive
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                      ].join(" ")}
                      onClick={() => {
                        haptic.selection();
                        setActiveTab(tab.id);
                      }}
                    >
                      <span className="text-sm sm:text-base shrink-0">{tab.icon}</span>
                      <span className="font-medium whitespace-nowrap">
                        {tab.label}
                      </span>
                      {isFestivalSelected && tab.id === "festival" && (
                        <span className="hidden md:inline-flex ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/15 whitespace-nowrap">
                          {selectedTemplate}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <ListChecks className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>
                      {activeTab === "weekly"
                        ? currentListName
                        : activeTab === "festival"
                          ? "Festival Special"
                          : "Kitchen Essentials"}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completedCount} of {items.length} items checked
                    {activeTab === "festival" && selectedTemplate && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-orange-400">
                        • Using {selectedTemplate} template
                      </span>
                    )}
                    {activeTab === "kitchen" && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-400">
                        • Viewing Kitchen Alerts
                      </span>
                    )}
                  </p>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-0 font-semibold text-xs px-2 py-1">
                  {Math.round(progress)}% Complete
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-3 sm:mb-5">
                <div className="h-2 sm:h-3 bg-muted/50 rounded-full overflow-hidden border border-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full relative overflow-hidden shadow-lg shadow-indigo-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>

              {/* Shopping Items (filtered) */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 max-h-80 sm:max-h-96 overflow-y-auto">
                {query && (
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    {filteredItems.length} of {items.length} items shown
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, height: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ x: 4 }}
                      layout
                      className="flex items-center justify-between p-2 sm:p-4 rounded-lg sm:rounded-xl bg-card hover:bg-muted/50 transition-all group border border-border haptic-light"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={item.isPurchased}
                          onCheckedChange={() => handleToggleItem(item.id)}
                          className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        />
                        <div
                          className={`flex-1 min-w-0 transition-all ${
                            item.isPurchased ? "opacity-50" : ""
                          }`}
                        >
                          <p
                            className={`font-semibold text-xs sm:text-base truncate ${
                              item.isPurchased ? "line-through" : ""
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                            <span>{item.quantity ? `${item.quantity} ${item.unit || ''}` : "No qty"}</span>
                            {item.price != null && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-medium">
                                ₹{item.price.toFixed(0)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-6 h-6 sm:w-7 sm:h-7 p-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                  {filteredItems.length === 0 && query && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs sm:text-sm text-muted-foreground text-center py-8 px-4"
                    >
                      <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="font-medium">No items found</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Try searching for "{query}" or clear the filter
                      </p>
                    </motion.div>
                  )}
                  {filteredItems.length === 0 && !query && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs sm:text-sm text-muted-foreground text-center py-8 px-4"
                    >
                      <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="font-medium">No items in this list</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Add some items to get started
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                variant="outline"
                className="w-full text-muted-foreground border-dashed border-2 hover:border-solid hover:bg-muted/50 hover:text-foreground transition-all h-8 text-xs sm:text-sm"
                onClick={() => {
                  haptic.light();
                  setIsAddItemOpen(true);
                }}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                <span>Add new item to list</span>
              </Button>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <div className="w-full overflow-hidden relative bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
            <div className="relative p-3 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-white flex-1">
                    <p className="text-[10px] sm:text-sm text-emerald-100 mb-0.5 sm:mb-1 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Estimated Total</span>
                    </p>
                    <p className="text-2xl sm:text-5xl font-bold drop-shadow-lg mb-0.5 sm:mb-1">
                      ₹{totalCost.toFixed(0)}
                    </p>
                    <p className="text-[9px] sm:text-xs text-emerald-100">
                      Based on {items.length} items
                    </p>
                  </div>
                  <div className="p-2 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl">
                    <ShoppingCart className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={completedCount === 0}
                  className="w-full bg-white text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-xl group h-8 text-xs sm:text-sm"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  <span>Mark as Purchased ({completedCount})</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
          </div>
        </div>

        {/* Mobile-Responsive Sidebar Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Festival Templates */}
          <Card className="mobile-card sm:card-premium">
            <CardHeader className="pb-2 sm:pb-4">
              <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <span>Festival Templates</span>
              </h3>
            </CardHeader>
            <CardContent className="space-y-1.5 sm:space-y-2">
              {festivalTemplates.map((template) => {
                const isSelected = selectedTemplate === template.name;

                return (
                  <motion.div
                    key={template.name}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => loadTemplate(template.name)}
                      className={`cursor-pointer transition-all border bg-card hover:shadow-md hover:bg-muted/50 ${
                        isSelected
                          ? "border-orange-400 shadow-[0_0_0_1px_rgba(249,115,22,0.6)] bg-orange-500/5"
                          : ""
                      }`}
                    >
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md sm:rounded-lg shrink-0 ${template.color} ${
                              isSelected ? "ring-2 ring-white/70" : ""
                            }`}
                          >
                            <span className="text-base sm:text-xl">{template.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs sm:text-sm truncate flex items-center gap-1 sm:gap-1.5">
                              <span>{template.name}</span>
                              {isSelected && (
                                <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/40">
                                  Selected
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {template.items} items
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Kitchen Reminders */}
          <Card className="mobile-card sm:card-premium border-l-4 border-red-500">
            <CardHeader className="pb-2 sm:pb-3">
              <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Kitchen Alerts</span>
              </h3>
            </CardHeader>
            <CardContent className="subsection-spacing">
              {kitchenReminders.map((reminder, index) => (
                <motion.div
                  key={reminder.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer hover:bg-muted/50 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all haptic-light"
                  onClick={() => handleKitchenAlertClick(reminder.status)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${reminder.color}`}
                    >
                      <reminder.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-medium text-xs sm:text-sm">{reminder.title}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Due today
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="mobile-card sm:card-premium">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <div className="p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md sm:rounded-lg">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm">Shopping Tips</h3>
              </div>
              <div className="subsection-spacing">
                {[
                  {
                    text: "Check inventory before shopping",
                    color: "bg-indigo-500",
                  },
                  {
                    text: "Buy fresh produce on weekends",
                    color: "bg-emerald-500",
                  },
                  {
                    text: "Use festival templates to save time",
                    color: "bg-orange-500",
                  },
                  {
                    text: "Compare prices at 3+ stores",
                    color: "bg-purple-500",
                  },
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 sm:gap-2.5"
                  >
                    <div
                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${tip.color} mt-1 sm:mt-1.5 shrink-0`}
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                      {tip.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ScheduleDialog
        open={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSchedule={({ date, note }) => {
          // Abhi ke लिए simple log; baad me isko reminders ya API se connect kar sakte ho
          console.log("Scheduled shopping:", {
            list: currentListName,
            date,
            note,
            itemsCount: items.length,
          });
        }}
      />
      <AddListDialog
        open={isNewListOpen}
        onClose={() => setIsNewListOpen(false)}
        onCreate={(name) => {
          setCurrentListName(name);
          setSelectedTemplate(null);
          setActiveTab("weekly");
          // Items will be managed by the new list created via API
        }}
      />

      <AddShoppingItemDialog
        open={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onAdd={async (newItem: NewShoppingItem) => {
          await addItem({
            name: newItem.name,
            quantity: newItem.qty,
            price: newItem.estimatedPrice,
          });
        }}
      />

      {/* Voice Input */}
      <VoiceInput
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onCommand={handleVoiceCommand}
      />
    </motion.div>
  );
}
