"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  Trash,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { NormalizedItem, HistoryEntry } from "./types";

export function ItemEditDialog({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: NormalizedItem | null;
  onClose: () => void;
  onSave: (updated: NormalizedItem) => void;
}) {
  const [saving, setSaving] = useState(false);

  const [local, setLocal] = useState<NormalizedItem | null>(() =>
    item ? { ...item } : null
  );

  // Sync when opening
  useEffect(() => {
    if (open && item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocal({ ...item });
    }
  }, [open, item]);

  if (!open || !local) return null;

  // ========= Helpers =========
  const update = (field: keyof NormalizedItem, value: unknown) => {
    setLocal((p) => ({ ...(p as NormalizedItem), [field]: value }));
  };

  const pushHistory = (action: HistoryEntry["action"], qty = 0) => {
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      action,
      qty,
      location: local.location,
    };

    setLocal((p) => ({
      ...(p as NormalizedItem),
      history: p?.history ? [entry, ...p.history] : [entry],
    }));
  };

  // ========= Quantity Actions =========
  const increaseQty = () => {
    update("qty", local.qty + 1);

    pushHistory("updated", 1);
  };

  const decreaseQty = () => {
    if (local.qty <= 0) return;

    update("qty", local.qty - 1);
    pushHistory("updated", 1);
  };

  // ========= Consume / Waste =========
  const markConsumed = () => {
    pushHistory("consumed", local.qty);
    update("qty", 0);
  };

  const markWasted = () => {
    // treat waste as updated (qty becomes zero)
    pushHistory("updated", local.qty);
    update("qty", 0);
  };

  // ========= Movement =========
  const moveItem = (newLoc: string) => {
    if (newLoc !== local.location) {
      pushHistory("moved", 0);
      update("location", newLoc);
    }
  };

  // ========= Save =========
  const handleSave = () => {
    setSaving(true);

    const updated: NormalizedItem = {
      ...local,
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSave(updated);
      setSaving(false);
      onClose();
    }, 150);
  };

  // ========= UI =========
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* BACKDROP */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xl"
      />

      {/* MODAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="
          relative z-[1000]
          w-[92%] max-w-lg
          max-h-[92vh]
          rounded-3xl overflow-hidden
          shadow-[0_20px_80px_rgba(0,0,0,0.35)]
          bg-gradient-to-br from-white/80 to-white/60
          dark:from-neutral-900/70 dark:to-neutral-800/50
          backdrop-blur-2xl border border-white/20 dark:border-white/10
          flex flex-col
        "
      >
        {/* HEADER */}
        <div
          className="
          sticky top-0
          dialog-padding dialog-spacing
          flex justify-between items-center
          bg-white/50 dark:bg-neutral-900/40
          border-b border-white/20 dark:border-white/10
        "
        >
          <h2 className="text-sm sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
            <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            Edit Item
          </h2>

          <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7 sm:h-9 sm:w-9">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* BODY */}
        <div className="dialog-padding dialog-spacing overflow-y-auto section-spacing custom-scroll">
          {/* EMOJI */}
          <div className="text-center text-5xl sm:text-7xl drop-shadow-xl">{local.img}</div>

          {/* FORM */}
          <Card className="bg-white/50 dark:bg-neutral-800/40 shadow-md border border-white/20">
            <CardContent className="section-spacing card-content-padding">
              {/* BASIC INFO */}
              <p className="text-[8px] sm:text-xs font-semibold text-emerald-600 uppercase">
                Basic Info
              </p>

              {/* NAME */}
              <div>
                <label className="text-[9px] sm:text-xs font-medium">Name</label>
                <Input
                  value={local.name}
                  onChange={(e) => {
                    update("name", e.target.value);
                  }}
                  className="mt-1"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="text-[9px] sm:text-xs font-medium">Category</label>
                <Input
                  value={local.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* STORAGE */}
              <p className="text-[8px] sm:text-xs font-semibold text-emerald-600 uppercase">
                Storage & Expiry
              </p>

              {/* LOCATION */}
              <div>
                <label className="text-[9px] sm:text-xs font-medium">Storage Location</label>
                <select
                  value={local.location}
                  onChange={(e) => moveItem(e.target.value)}
                  className="w-full h-8 sm:h-10 rounded-lg sm:rounded-xl border px-2.5 sm:px-3 bg-background text-[10px] sm:text-sm mt-1"
                >
                  <option value="Pantry">📦 Pantry</option>
                  <option value="Fridge">🧊 Fridge</option>
                  <option value="Freezer">❄️ Freezer</option>
                  <option value="Counter">🛋️ Counter</option>
                </select>
              </div>

              {/* EXPIRY DATE */}
              <div>
                <label className="text-[9px] sm:text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  Expiry Date
                </label>

                <Input
                  type="date"
                  value={local.expiry}
                  onChange={(e) => update("expiry", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* QUANTITY */}
              <p className="text-[8px] sm:text-xs font-semibold text-emerald-600 uppercase">
                Quantity & Notes
              </p>

              <div>
                <label className="text-[9px] sm:text-xs font-medium">Quantity</label>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                  <Button size="icon" variant="outline" onClick={decreaseQty} className="h-8 w-8 sm:h-9 sm:w-9">
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>

                  <Input
                    type="number"
                    value={local.qty}
                    className="text-center"
                    onChange={(e) => update("qty", Number(e.target.value))}
                  />

                  <Button size="icon" variant="outline" onClick={increaseQty} className="h-8 w-8 sm:h-9 sm:w-9">
                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="text-[9px] sm:text-xs font-medium">Notes</label>
                <Textarea
                  value={local.notes || ""}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Extra details..."
                  className="min-h-[70px] sm:min-h-[90px] mt-1"
                />
              </div>

              {/* ACTIONS */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                <Button
                  variant="secondary"
                  onClick={markConsumed}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm h-8 sm:h-9"
                >
                  <Trash className="w-3 h-3 sm:w-4 sm:h-4" /> Consumed
                </Button>

                <Button
                  variant="destructive"
                  onClick={markWasted}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm h-8 sm:h-9"
                >
                  <Trash className="w-3 h-3 sm:w-4 sm:h-4" /> Wasted
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 dialog-padding dialog-spacing bg-white/50 dark:bg-neutral-900/40 border-t border-white/20">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-500 text-white h-8 sm:h-9 text-[10px] sm:text-sm"
          >
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
