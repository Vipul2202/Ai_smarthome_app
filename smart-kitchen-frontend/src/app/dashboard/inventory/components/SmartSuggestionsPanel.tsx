// components/SmartSuggestionsPanel.tsx
"use client";

import { Lightbulb, AlertTriangle, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SmartSuggestions } from "../inventory-utils/smart-suggestions";

type Props = {
  suggestions: SmartSuggestions;
  onClickLowStock?: () => void;
  onClickExpiringSoon?: () => void;
  onClickRecommended?: () => void;
};

export function SmartSuggestionsPanel({
  suggestions,
  onClickLowStock,
  onClickExpiringSoon,
  onClickRecommended,
}: Props) {
  const lowCount = suggestions.lowStock.length;
  const expiringCount = suggestions.expiringSoon.length;
  const recommendedCount = suggestions.recommendedRestock.length;

  if (!lowCount && !expiringCount && !recommendedCount) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {/* Low stock */}
      <Card className="mobile-card sm:bg-white sm:dark:bg-slate-900 sm:border sm:border-gray-200/40 sm:dark:border-slate-700/40 hover-lift border-0 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-background">
        <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500 flex items-center justify-center shadow-amber-500/40 shadow">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400 font-semibold">
                Low stock
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {lowCount
                  ? `${lowCount} item${lowCount > 1 ? "s" : ""} nearly empty`
                  : "All good here"}
              </p>
            </div>
          </div>
          {lowCount > 0 && (
            <Button size="sm" variant="outline" className="mobile-btn-sm" onClick={onClickLowStock}>
              View
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Expiring soon */}
      <Card className="mobile-card sm:bg-white sm:dark:bg-slate-900 sm:border sm:border-gray-200/40 sm:dark:border-slate-700/40 hover-lift border-0 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-background">
        <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-500 flex items-center justify-center shadow-rose-500/40 shadow">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400 font-semibold">
                Expiring soon
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {expiringCount
                  ? `${expiringCount} item${expiringCount > 1 ? "s" : ""} expiring soon`
                  : "No urgent expiries"}
              </p>
            </div>
          </div>
          {expiringCount > 0 && (
            <Button size="sm" variant="outline" className="mobile-btn-sm" onClick={onClickExpiringSoon}>
              Show
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Recommended restock */}
      <Card className="mobile-card sm:bg-white sm:dark:bg-slate-900 sm:border sm:border-gray-200/40 sm:dark:border-slate-700/40 hover-lift border-0 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-background">
        <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald-500/40 shadow">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-semibold">
                Smart shopping
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {recommendedCount
                  ? `${recommendedCount} item${recommendedCount > 1 ? "s" : ""} to buy next`
                  : "No urgent shopping suggestions"}
              </p>
            </div>
          </div>
          {recommendedCount > 0 && (
            <Button size="sm" variant="outline" className="mobile-btn-sm" onClick={onClickRecommended}>
              See list
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
