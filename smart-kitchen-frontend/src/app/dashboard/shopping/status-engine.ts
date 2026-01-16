// --------------------------------------------------
// SMART KITCHEN INVENTORY ENGINE — 2025 Unified Model
// --------------------------------------------------

import type {
  NormalizedItem as InventoryItem,
  InventoryStatus as ItemStatus,
} from "@/app/dashboard/inventory/types";

// ---------------------------------------------
// CATEGORY MAPPER
// ---------------------------------------------
export function inferCategory(name: string): string {
  const n = name.toLowerCase();

  if (n.includes("rice") || n.includes("flour")) return "Grains";
  if (n.includes("milk") || n.includes("cheese") || n.includes("curd")) return "Dairy";
  if (n.includes("tomato") || n.includes("onion") || n.includes("potato")) return "Vegetables";
  if (n.includes("oil") || n.includes("salt") || n.includes("masala")) return "Cooking";
  if (n.includes("tea") || n.includes("coffee")) return "Beverages";

  return "Pantry";
}

// ---------------------------------------------
// EMOJI MAPPER
// ---------------------------------------------
export function inferEmoji(name: string): string {
  const n = name.toLowerCase();

  if (n.includes("rice")) return "🌾";
  if (n.includes("milk") || n.includes("curd")) return "🥛";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("onion")) return "🧅";
  if (n.includes("bread")) return "🍞";
  if (n.includes("egg")) return "🥚";
  if (n.includes("tea") || n.includes("coffee")) return "🍵";
  if (n.includes("oil")) return "🛢️";

  return "🥫";
}

// ---------------------------------------------
// SMART STATUS ENGINE
// ---------------------------------------------
export function computeStatusForItem(
  item: InventoryItem,
  globalLowThreshold: number
): ItemStatus {
  const today = new Date();
  const exp = new Date(item.expiry);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return "expired";
  if (diffDays <= 2) return "expiring";

  const perishables = ["milk", "curd", "cheese", "tomato", "onion"];

  if (perishables.some((p) => item.name.toLowerCase().includes(p)) && diffDays <= 4)
    return "expiring";

  const threshold = item.lowThreshold ?? globalLowThreshold;
  if (item.qty <= threshold) return "low";

  return "ok";
}

// ---------------------------------------------
// HEAT INDEX ENGINE (Feature #5)
// ---------------------------------------------
export function computeHeatIndex(item: InventoryItem) {
  const today = new Date();
  const exp = new Date(item.expiry);
  const days = Math.ceil((exp.getTime() - today.getTime()) / 86400000);

  let expiryFactor = 0;
  if (days < 0) expiryFactor = 100;
  else if (days <= 1) expiryFactor = 90;
  else if (days <= 3) expiryFactor = 75;
  else if (days <= 7) expiryFactor = 55;
  else expiryFactor = Math.max(10, 100 - days * 2);

  const perishables = ["milk", "curd", "cheese", "tomato", "onion"];
  const perishableBoost = perishables.some((p) => item.name.toLowerCase().includes(p))
    ? 15
    : 0;

  const stockFactor = item.qty <= (item.lowThreshold ?? 1) ? 25 : 5;

  let score = expiryFactor * 0.65 + perishableBoost * 0.2 + stockFactor * 0.15;
  score = Math.round(Math.min(100, score));

  let color: "green" | "yellow" | "orange" | "red";
  if (score >= 85) color = "red";
  else if (score >= 60) color = "orange";
  else if (score >= 35) color = "yellow";
  else color = "green";

  return { score, color };
}

// ---------------------------------------------
// RECALCULATE ALL ITEMS
// ---------------------------------------------
export function recalcInventory(
  items: InventoryItem[],
  globalLowThreshold: number
): InventoryItem[] {
  return items.map((i) => {
    const status = computeStatusForItem(i, globalLowThreshold);
    const { score, color } = computeHeatIndex(i);

    return {
      ...i,
      status,
      heatScore: score,
      heatColor: color,
      updatedAt: new Date().toISOString(),
    };
  });
}

// ---------------------------------------------
// SORTING ENGINE
// ---------------------------------------------
export type SortType = "expiry" | "qtyAsc" | "qtyDesc" | "recent" | "heat";

export function sortItems(items: InventoryItem[], type: SortType) {
  const sorted = [...items];

  switch (type) {
    case "expiry":
      sorted.sort(
        (a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
      );
      break;

    case "qtyAsc":
      sorted.sort((a, b) => a.qty - b.qty);
      break;

    case "qtyDesc":
      sorted.sort((a, b) => b.qty - a.qty);
      break;

    case "recent":
      sorted.sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.expiry).getTime() -
          new Date(a.updatedAt ?? a.expiry).getTime()
      );
      break;

    case "heat":
      sorted.sort((a, b) => (b.heatScore ?? 0) - (a.heatScore ?? 0));
      break;
  }

  return sorted;
}
