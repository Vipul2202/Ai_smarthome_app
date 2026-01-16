// inventory-utils.ts
// ---------------------------------------------
// INVENTORY CORE ENGINE – Smart Kitchen 2025
// ---------------------------------------------

import type {
  InventoryStatus,
  NormalizedItem,
} from "./types";

// Raw unprocessed input from UI, scanner, bulk upload, or API
export interface RawItemInput {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category?: string;
  location?: string;
  expiry?: string;
}

// ---------------------------------------------
// CATEGORY MAPPER (Auto-detection)
// ---------------------------------------------
export function inferCategory(name: string): string {
  const n = name.toLowerCase();

  if (n.includes("rice") || n.includes("wheat") || n.includes("flour"))
    return "Grains";

  if (n.includes("milk") || n.includes("cheese") || n.includes("curd"))
    return "Dairy";

  if (n.includes("tomato") || n.includes("onion") || n.includes("potato"))
    return "Vegetables";

  if (n.includes("oil") || n.includes("salt") || n.includes("masala"))
    return "Cooking";

  if (n.includes("tea") || n.includes("coffee") || n.includes("juice"))
    return "Beverages";

  return "Pantry";
}

// ---------------------------------------------
// EMOJI MAPPER (Auto-detection)
// ---------------------------------------------
export function inferEmoji(name: string): string {
  const n = name.toLowerCase();

  if (n.includes("rice")) return "🌾";
  if (n.includes("milk") || n.includes("curd") || n.includes("yogurt"))
    return "🥛";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("onion")) return "🧅";
  if (n.includes("bread")) return "🍞";
  if (n.includes("egg")) return "🥚";
  if (n.includes("tea") || n.includes("coffee")) return "🍵";
  if (n.includes("oil")) return "🛢️";

  return "🥫";
}

// ---------------------------------------------
// LEGACY EXPIRY ENGINE (fallback, not used now)
// ---------------------------------------------
export function computeStatus(expiry: string): InventoryStatus {
  if (!expiry) return "ok";

  const today = new Date();
  const exp = new Date(expiry);
  const diff = Math.ceil((exp.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return "expired";
  if (diff <= 2) return "expiring";
  if (diff <= 5) return "low";

  return "ok";
}

// ---------------------------------------------
// ADVANCED SMART STATUS ENGINE
// expiry + perishability + lowThreshold + globalThreshold
// ---------------------------------------------
export function computeStatusForItem(
  item: NormalizedItem,
  globalLowThreshold: number
): InventoryStatus {
  const today = new Date();
  const exp = new Date(item.expiry);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return "expired";
  if (diffDays <= 2) return "expiring";

  const perishables = ["milk", "curd", "cheese", "tomato", "onion"];
  const isPerishable = perishables.some((p) =>
    item.name.toLowerCase().includes(p)
  );

  if (isPerishable && diffDays <= 4) return "expiring";

  const threshold = item.lowThreshold ?? globalLowThreshold;
  if (item.qty <= threshold) return "low";

  return "ok";
}

// ---------------------------------------------
// NORMALIZER — Raw → Normalized
// ---------------------------------------------
export function normalizeItem(raw: RawItemInput): NormalizedItem {
  return {
    id: raw.id,
    name: raw.name.trim(),
    qty: raw.qty,
    unit: raw.unit,
    location: raw.location || "Pantry",
    category: raw.category || inferCategory(raw.name),
    expiry: raw.expiry || new Date().toISOString().slice(0, 10),
    img: inferEmoji(raw.name),
    status: "ok",
    addedAt: Date.now(),

    lowThreshold: undefined,

    notes: "",
    tags: [],
    updatedAt: new Date().toISOString(),
    history: [],

    heatScore: 0,
    heatColor: "green",
  };
}

// ---------------------------------------------
// HEAT INDEX ENGINE – Feature #5
// ---------------------------------------------
export function computeHeatIndex(item: NormalizedItem): {
  score: number;
  color: "green" | "yellow" | "orange" | "red";
} {
  const today = new Date();
  const exp = new Date(item.expiry);
  const days = Math.ceil((exp.getTime() - today.getTime()) / 86400000);

  // Expiry urgency
  let expiryFactor = 0;
  if (days < 0) expiryFactor = 100;
  else if (days <= 1) expiryFactor = 90;
  else if (days <= 3) expiryFactor = 75;
  else if (days <= 7) expiryFactor = 55;
  else expiryFactor = Math.max(10, 100 - days * 2);

  // Perishable boost
  const perishables = ["milk", "curd", "cheese", "tomato", "onion"];
  const perishable = perishables.some((p) =>
    item.name.toLowerCase().includes(p)
  );
  const perishFactor = perishable ? 15 : 0;

  // Low stock increases risk
  const stockFactor = item.qty <= (item.lowThreshold ?? 1) ? 25 : 5;

  // Weighted final score
  let score = expiryFactor * 0.65 + perishFactor * 0.2 + stockFactor * 0.15;
  score = Math.min(100, Math.round(score));

  let color: "green" | "yellow" | "orange" | "red";
  if (score >= 85) color = "red";
  else if (score >= 60) color = "orange";
  else if (score >= 35) color = "yellow";
  else color = "green";

  return { score, color };
}

// ---------------------------------------------
// RECALCULATE STATUS + HEAT INDEX FOR ALL ITEMS
// ---------------------------------------------
export function recalcInventory(
  items: NormalizedItem[],
  globalLowThreshold: number
): NormalizedItem[] {
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

export function sortItems(items: NormalizedItem[], type: SortType) {
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
      sorted.sort((a, b) => b.addedAt - a.addedAt);
      break;

    case "heat":
      sorted.sort((a, b) => (b.heatScore ?? 0) - (a.heatScore ?? 0));
      break;
  }

  return sorted;
}
