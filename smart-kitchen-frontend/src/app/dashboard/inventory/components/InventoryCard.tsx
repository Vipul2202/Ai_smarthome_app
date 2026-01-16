"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NormalizedItem } from "../types";
import { CheckSquare, Calendar } from "lucide-react";

export function InventoryCard({
  item,
  isSelected,
  viewMode = "grid",
  onClick,
}: {
  item: NormalizedItem;
  isSelected?: boolean;
  viewMode?: "grid" | "list";
  onClick?: () => void;
}) {
  const statusConfig = {
    ok: {
      color: "bg-emerald-500",
      label: "In Stock",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
    },
    low: {
      color: "bg-amber-500",
      label: "Low Stock",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
    },
    expiring: {
      color: "bg-orange-500",
      label: "Expiring Soon",
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
    },
    expired: {
      color: "bg-red-500",
      label: "Expired",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/30",
    },
  } as const;

  const status = statusConfig[item.status];

  const locationIcon = {
    Fridge: "🧊",
    Freezer: "❄️",
    Pantry: "📦",
    Counter: "🛋️",
  }[item.location];

  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        onClick={onClick}
        className={`mobile-card sm:bg-white sm:dark:bg-slate-900 sm:border sm:border-gray-200/40 sm:dark:border-slate-700/40 cursor-pointer group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
          isSelected ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background" : ""
        }`}
      >
        <CardContent className="p-2 sm:p-2.5">
          <div className="flex justify-between mb-1.5 sm:mb-2">
            <div className="text-xl sm:text-2xl">{item.img}</div>

            {isSelected && (
              <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
            )}
          </div>

          <h3 className="font-bold text-[10px] sm:text-xs mb-1 truncate">{item.name}</h3>

          <div className="flex items-baseline gap-1 mb-1 sm:mb-1.5">
            <p className="text-sm sm:text-lg font-bold">{item.qty}</p>
            <p className="text-[9px] sm:text-xs text-muted-foreground">{item.unit}</p>
          </div>

          <Badge className={`${status.badge} w-full justify-center text-[8px] sm:text-[10px] px-1 py-0.5`}>
            {status.label}
          </Badge>

          <div className="flex justify-between text-[8px] sm:text-[10px] mt-1 sm:mt-1.5 text-muted-foreground">
            <span>
              {locationIcon} {item.location}
            </span>

            <span className="flex items-center gap-0.5">
              <Calendar className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              {item.expiry ? item.expiry.slice(5) : 'N/A'}
            </span>
          </div>

          {/* Heat bar */}
          {item.heatScore !== undefined && (
            <div className="mt-1 sm:mt-1.5 w-full h-0.5 sm:h-1 bg-muted rounded overflow-hidden">
              <div
                className={`
                  h-full
                  ${
                    item.heatColor === "red"
                      ? "bg-red-500"
                      : item.heatColor === "orange"
                      ? "bg-orange-500"
                      : item.heatColor === "yellow"
                      ? "bg-yellow-400"
                      : "bg-emerald-500"
                  }
                `}
                style={{ width: `${item.heatScore}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
