// inventory-utils/smart-suggestions.ts
import type { NormalizedItem as InventoryItem } from "../types";

export type SmartSuggestions = {
  lowStock: InventoryItem[];
  expiringSoon: InventoryItem[];
  recommendedRestock: InventoryItem[];
  overstocked: InventoryItem[];
};

const DAYS = 24 * 60 * 60 * 1000;

export function getSmartSuggestionsLocal(
  items: InventoryItem[],
  globalLowThreshold: number
): SmartSuggestions {
  const now = Date.now();

  const expiringSoon: InventoryItem[] = [];
  const lowStock: InventoryItem[] = [];
  const recommendedRestock: InventoryItem[] = [];
  const overstocked: InventoryItem[] = [];

  for (const item of items) {
    const lowThreshold = item.lowThreshold ?? globalLowThreshold;

    if (item.qty <= lowThreshold) {
      lowStock.push(item);
      recommendedRestock.push(item);
    }

    if (item.expiry) {
      const t = new Date(item.expiry).getTime();
      const diffDays = (t - now) / DAYS;
      if (diffDays >= 0 && diffDays <= 5) {
        expiringSoon.push(item);
      }
    }

    if (item.qty >= (lowThreshold || 1) * 5) {
      overstocked.push(item);
    }
  }

  return {
    lowStock,
    expiringSoon,
    recommendedRestock,
    overstocked,
  };
}
