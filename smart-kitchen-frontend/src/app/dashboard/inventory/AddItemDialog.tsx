// apps/web/src/app/dashboard/inventory/AddItemDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { smartPredict } from "./inventory-utils/smart-ai";

import {
  X,
  Package,
  Calendar,
  MapPin,
  Hash,
  Tag,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// -------------------------------
// Types
// -------------------------------
export interface SuggestedItem {
  name: string;
  qty: string;
  unit: string;
  location: string;
  expiry: string;
  category: string;
}

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedItem?: SuggestedItem | null;
  onAdd?: (payload: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    location: string;
    expiryDate: string;
    emoji: string;
  }) => void;
}

// Optional local typing for AI result (we just cast from smartPredict)
type SmartAIResult = {
  name?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  location?: string;
  expiryDate?: string;
  emoji?: string;
  reasoning?: string;
};

// -------------------------------
// Constants
// -------------------------------
const categories = [
  { name: "Grains", emoji: "🌾" },
  { name: "Vegetables", emoji: "🥕" },
  { name: "Fruits", emoji: "🍎" },
  { name: "Dairy", emoji: "🥛" },
  { name: "Meat", emoji: "🍖" },
  { name: "Cooking", emoji: "🧈" },
  { name: "Pantry", emoji: "🥫" },
  { name: "Beverages", emoji: "☕" },
  { name: "Snacks", emoji: "🍿" },
  { name: "Frozen", emoji: "❄️" },
];

const locations = [
  { name: "Fridge", emoji: "🧊" },
  { name: "Freezer", emoji: "❄️" },
  { name: "Pantry", emoji: "📦" },
  { name: "Counter", emoji: "🛋️" },
];

const units = ["kg", "g", "L", "ml", "pcs", "pack", "bag", "box"];

// -------------------------------
// Smart defaults
// -------------------------------
type SmartPreset = {
  keywords: string[];
  category: string;
  emoji: string;
  defaultExpiryDays: number;
};

const SMART_PRESETS: SmartPreset[] = [
  {
    keywords: ["rice", "wheat", "atta", "flour"],
    category: "Grains",
    emoji: "🌾",
    defaultExpiryDays: 180,
  },
  {
    keywords: ["onion", "garlic"],
    category: "Vegetables",
    emoji: "🧅",
    defaultExpiryDays: 30,
  },
  {
    keywords: ["tomato"],
    category: "Vegetables",
    emoji: "🍅",
    defaultExpiryDays: 7,
  },
  {
    keywords: ["potato", "aloo"],
    category: "Vegetables",
    emoji: "🥔",
    defaultExpiryDays: 45,
  },
  {
    keywords: ["milk", "curd", "yogurt", "paneer"],
    category: "Dairy",
    emoji: "🥛",
    defaultExpiryDays: 4,
  },
  {
    keywords: ["egg", "eggs"],
    category: "Dairy",
    emoji: "🥚",
    defaultExpiryDays: 14,
  },
  {
    keywords: ["chicken", "meat", "mutton", "fish"],
    category: "Meat",
    emoji: "🍗",
    defaultExpiryDays: 3,
  },
  {
    keywords: ["oil", "ghee", "butter"],
    category: "Cooking",
    emoji: "🧈",
    defaultExpiryDays: 120,
  },
  {
    keywords: ["apple", "banana", "mango", "orange"],
    category: "Fruits",
    emoji: "🍎",
    defaultExpiryDays: 7,
  },
  {
    keywords: ["ice cream", "frozen", "peas"],
    category: "Frozen",
    emoji: "❄️",
    defaultExpiryDays: 60,
  },
];

function getSmartDefaultsForName(name: string | undefined | null) {
  const lower = (name ?? "").toLowerCase().trim();
  if (!lower) {
    return {
      category: "Pantry",
      emoji: "🥫",
      defaultExpiryDays: 90,
    };
  }

  for (const preset of SMART_PRESETS) {
    if (preset.keywords.some((k) => lower.includes(k))) {
      return {
        category: preset.category,
        emoji: preset.emoji,
        defaultExpiryDays: preset.defaultExpiryDays,
      };
    }
  }

  return {
    category: "Pantry",
    emoji: "🥫",
    defaultExpiryDays: 90,
  };
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// -------------------------------
// Component
// -------------------------------
export function AddItemDialog({
  isOpen,
  onClose,
  suggestedItem,
  onAdd,
}: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "kg",
    category: "",
    location: "",
    expiryDate: "",
    emoji: "📦",
  });

  const [step, setStep] = useState(1);
  const [categoryTouched, setCategoryTouched] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Prefill from Scan → Suggestion
  useEffect(() => {
    if (isOpen && suggestedItem) {
      const smart = getSmartDefaultsForName(suggestedItem.name);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: suggestedItem.name,
        quantity: suggestedItem.qty,
        unit: suggestedItem.unit || "pcs",
        category: suggestedItem.category || smart.category,
        location: suggestedItem.location || "Fridge",
        expiryDate: suggestedItem.expiry || "",
        emoji: smart.emoji,
      });

      setCategoryTouched(!!suggestedItem.category);
      setStep(2);
      setAiMessage(null);
    }
  }, [isOpen, suggestedItem]);

  // Auto category + emoji from name (if user hasn't manually picked category)
  useEffect(() => {
    if (!formData.name) return;

    const smart = getSmartDefaultsForName(formData.name);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({
      ...prev,
      category:
        categoryTouched && prev.category ? prev.category : smart.category,
      emoji: smart.emoji,
    }));
  }, [formData.name, categoryTouched]);

  const smartDefaults = getSmartDefaultsForName(formData.name);
  const suggestedExpiryDate =
    formData.expiryDate ||
    toInputDate(addDays(new Date(), smartDefaults.defaultExpiryDays));

  // -------------------------------
  // AI smart suggestion handler
  // -------------------------------
  const handleSmartFill = async () => {
    if (!formData.name.trim()) {
      setAiMessage("Enter an item name first so AI can help.");
      return;
    }

    try {
      setAiLoading(true);
      setAiMessage("Thinking…");

      const quantityNumber = Number(formData.quantity || 0) || undefined;

      // smartPredict implementation is in ./inventory-utils/smart-ai
      const result = (await smartPredict({
        name: formData.name.trim(),
        quantity: quantityNumber,
        unit: formData.unit,
        category: formData.category || undefined,
        location: formData.location || undefined,
      })) as SmartAIResult;

      const mergedDefaults = getSmartDefaultsForName(
        result.name || formData.name
      );

      setFormData((prev) => ({
        ...prev,
        name: result.name || prev.name,
        quantity:
          typeof result.quantity === "number"
            ? String(result.quantity)
            : prev.quantity,
        unit: result.unit || prev.unit,
        category:
          result.category ||
          prev.category ||
          mergedDefaults.category ||
          "Pantry",
        location: result.location || prev.location || "Pantry",
        expiryDate:
          result.expiryDate ||
          prev.expiryDate ||
          toInputDate(
            addDays(new Date(), mergedDefaults.defaultExpiryDays || 90)
          ),
        emoji: result.emoji || prev.emoji || mergedDefaults.emoji || "🥫",
      }));

      setCategoryTouched(true);

      setAiMessage(
        result.reasoning ||
          "AI filled details based on item name and common usage."
      );
    } catch (err) {
      console.error("smartPredict failed", err);
      setAiMessage(
        "AI suggestion failed, using normal smart defaults instead."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------
  // Form submission
  // -------------------------------
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!onAdd) {
      onClose();
      return;
    }

    const quantityNumber = Number(formData.quantity || 0);
    if (!formData.name || !quantityNumber) return;

    const finalExpiry =
      formData.expiryDate || suggestedExpiryDate || toInputDate(new Date());

    onAdd({
      name: formData.name.trim(),
      quantity: quantityNumber,
      unit: formData.unit,
      category: formData.category || smartDefaults.category,
      location: formData.location || "Pantry",
      expiryDate: finalExpiry,
      emoji: formData.emoji || smartDefaults.emoji,
    });

    // Reset state
    onClose();
    setStep(1);
    setCategoryTouched(false);
    setAiMessage(null);
    setFormData({
      name: "",
      quantity: "",
      unit: "kg",
      category: "",
      location: "",
      expiryDate: "",
      emoji: "📦",
    });
  };

  // Step rules
  const canProceedStep1 = formData.name && formData.quantity && formData.unit;
  const canProceedStep2 = formData.category && formData.location;
  const canSubmit = canProceedStep1 && canProceedStep2 && suggestedExpiryDate;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 bg-card/90">
                <CardContent className="p-0">
                  {/* HEADER */}
                  <div className="relative px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-500 text-white">
                    <button
                      type="button"
                      onClick={onClose}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full bg-black/10 hover:bg-black/20 h-8 w-8 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center bg-white/15 rounded-xl">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Add inventory item
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI + smart presets for category, emoji & expiry
                        </p>
                        <p className="text-[11px] sm:text-xs text-emerald-50/80">
                          Step {step} of 3 · Smart Kitchen Manager
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-3 flex items-center gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 flex-1 rounded-full ${
                            s <= step
                              ? "bg-white shadow-sm shadow-emerald-900/40"
                              : "bg-white/35"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* BODY */}
                  <form
                    onSubmit={handleSubmit}
                    className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 max-h-[calc(90vh-165px)] overflow-y-auto"
                  >
                    <AnimatePresence mode="wait">
                      {/* STEP 1 */}
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          className="grid gap-6 md:grid-cols-[1.25fr_1fr]"
                        >
                          {/* LEFT: name + qty */}
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                                  Item name
                                </Label>

                                {/* AI button */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSmartFill}
                                  disabled={aiLoading || !formData.name.trim()}
                                  className="h-7 px-2 text-[11px] gap-1 rounded-full border-emerald-300/70 bg-emerald-50/40 hover:bg-emerald-100/70"
                                >
                                  <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                                  {aiLoading ? "AI thinking…" : "AI Suggest"}
                                </Button>
                              </div>

                              <Input
                                placeholder="Basmati rice, tomatoes..."
                                value={formData.name}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  });
                                  setAiMessage(null);
                                }}
                                className="h-11 bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40"
                              />
                            </div>

                            <div className="grid grid-cols-[1.2fr_1fr] gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                                  <Hash className="w-3.5 h-3.5 text-emerald-500" />
                                  Quantity
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0"
                                  value={formData.quantity}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      quantity: e.target.value,
                                    })
                                  }
                                  className="h-11 bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  Unit
                                </Label>
                                <select
                                  value={formData.unit}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      unit: e.target.value,
                                    })
                                  }
                                  className="h-11 bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 rounded-xl border px-3 text-sm"
                                >
                                  {units.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {aiMessage && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                {aiMessage}
                              </p>
                            )}
                          </div>

                          {/* RIGHT: icon preview */}
                          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/40 px-4 py-5">
                            <motion.div
                              className="text-4xl sm:text-5xl h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg text-white"
                              whileHover={{ scale: 1.03 }}
                            >
                              {formData.emoji}
                            </motion.div>
                            <p className="text-xs text-muted-foreground text-center">
                              Icon auto-selected from name / AI. You can change
                              it later from item edit.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 2 */}
                      {step === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          className="space-y-6"
                        >
                          {/* CATEGORY */}
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                              <Tag className="w-3.5 h-3.5 text-emerald-500" />
                              Category
                            </Label>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                              {categories.map((cat) => {
                                const selected = formData.category === cat.name;
                                return (
                                  <button
                                    key={cat.name}
                                    type="button"
                                    onClick={() => {
                                      setCategoryTouched(true);
                                      setFormData({
                                        ...formData,
                                        category: cat.name,
                                      });
                                    }}
                                    className={`flex flex-col items-center justify-center rounded-xl border-2 px-2 py-3 transition-all ${
                                      selected
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                        : "border-border bg-background hover:border-emerald-300"
                                    }`}
                                  >
                                    <div className="text-xl">{cat.emoji}</div>
                                    <span className="text-xs truncate">
                                      {cat.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {!formData.category && formData.name && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Suggested: {smartDefaults.category}
                              </p>
                            )}
                          </div>

                          {/* LOCATION */}
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                              Storage location
                            </Label>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {locations.map((loc) => {
                                const selected = formData.location === loc.name;
                                return (
                                  <button
                                    key={loc.name}
                                    type="button"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        location: loc.name,
                                      })
                                    }
                                    className={`flex flex-col items-center justify-center rounded-xl border-2 px-3 py-3 transition-all ${
                                      selected
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                        : "border-border bg-background hover:border-emerald-300"
                                    }`}
                                  >
                                    <span className="text-2xl">
                                      {loc.emoji}
                                    </span>
                                    <span className="text-xs font-medium">
                                      {loc.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 3 */}
                      {step === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          className="space-y-6"
                        >
                          {/* EXPIRY */}
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                              Expiry date
                            </Label>
                            <Input
                              type="date"
                              value={formData.expiryDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  expiryDate: e.target.value,
                                })
                              }
                              min={new Date().toISOString().slice(0, 10)}
                              className="h-11 bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40"
                            />
                            <p className="text-[11px] text-muted-foreground">
                              <span className="font-medium">
                                <Sparkles className="inline-block w-3 h-3 mr-1" />
                                Suggested:
                              </span>{" "}
                              {suggestedExpiryDate} (
                              {smartDefaults.defaultExpiryDays} days from today
                              for {smartDefaults.category})
                            </p>
                          </div>

                          {/* SUMMARY */}
                          <Card className="bg-muted/40 border-0">
                            <CardContent className="p-4 space-y-3">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Summary
                              </h4>

                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <Detail label="Item" value={formData.name} />
                                <Detail
                                  label="Quantity"
                                  value={`${formData.quantity || "—"} ${
                                    formData.quantity ? formData.unit : ""
                                  }`}
                                />
                                <Detail
                                  label="Category"
                                  value={
                                    formData.category ||
                                    smartDefaults.category ||
                                    "Not set"
                                  }
                                />
                                <Detail
                                  label="Location"
                                  value={formData.location || "Not set"}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  {/* FOOTER */}
                  <div className="flex items-center gap-3 border-t bg-muted/40 px-4 py-3">
                    {step > 1 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep(step - 1)}
                      >
                        Back
                      </Button>
                    ) : (
                      <span className="inline-block w-[72px]" />
                    )}

                    <div className="ml-auto">
                      {step < 3 ? (
                        <Button
                          size="sm"
                          onClick={() => setStep(step + 1)}
                          disabled={
                            (step === 1 && !canProceedStep1) ||
                            (step === 2 && !canProceedStep2)
                          }
                          className="bg-emerald-500 text-white px-5 shadow-lg"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSubmit()}
                          disabled={!canSubmit}
                          className="bg-emerald-600 text-white px-6 shadow-lg"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold truncate">{value}</p>
    </div>
  );
}
