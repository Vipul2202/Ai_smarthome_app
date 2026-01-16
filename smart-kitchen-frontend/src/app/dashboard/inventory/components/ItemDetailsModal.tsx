"use client";

import { motion } from "framer-motion";
import type { NormalizedItem } from "../types";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { DetailRow } from "./DetailRow";

export function ItemDetailsModal({
  item,
  open,
  onClose,
  onEdit,
  globalLowThreshold,
}: {
  item: NormalizedItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  globalLowThreshold: number;
}) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-[1000] w-[92%] max-w-md rounded-3xl p-6 shadow-xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">{item.name}</h2>

          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-500 text-white" onClick={onEdit}>
              Edit
            </Button>

            <Button size="icon" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* Food icon */}
        <div className="text-center text-6xl mb-4">{item.img}</div>

        <div className="space-y-2">
          <DetailRow label="Quantity" value={`${item.qty} ${item.unit}`} />
          <DetailRow label="Category" value={item.category} />
          <DetailRow label="Location" value={item.location} />
          <DetailRow
            label="Expiry"
            value={new Date(item.expiry).toLocaleDateString()}
          />
          <DetailRow label="Status" value={item.status} />
          <DetailRow
            label="Low Threshold"
            value={
              item.lowThreshold !== undefined
                ? `${item.lowThreshold} (custom)`
                : `Global (${globalLowThreshold})`
            }
          />
          <DetailRow label="Heat Score" value={`${item.heatScore ?? 0}%`} />
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />

        <h3 className="font-semibold text-sm mb-2">Recent History</h3>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {(item.history?.slice(0, 5) ?? []).map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted border shadow-sm"
            >
              <Clock className="w-4 h-4 opacity-60" />

              <div className="text-xs">
                <p className="font-medium">{h.action}</p>
                <p className="text-muted-foreground text-[11px]">
                  {h.qty} {item.unit} • {h.location}
                </p>
                <p className="text-[10px] opacity-70">
                  {new Date(h.date).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
