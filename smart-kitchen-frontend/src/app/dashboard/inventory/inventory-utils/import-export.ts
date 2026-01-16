// inventory-utils/import-export.ts
import type { NormalizedItem as InventoryItem } from "../types";

export function exportInventoryJSON(items: InventoryItem[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
    },
    null,
    2
  );
}

export function parseImportedInventoryJSON(text: string): InventoryItem[] {
  const parsed = JSON.parse(text);

  if (Array.isArray(parsed)) {
    return normalizeItems(parsed);
  }

  if (parsed && Array.isArray(parsed.items)) {
    return normalizeItems(parsed.items);
  }

  throw new Error("Invalid JSON format for inventory import");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItems(list: any[]): InventoryItem[] {
  return list.map((raw) => {
    const base: InventoryItem = {
      id: raw.id ?? "",
      name: String(raw.name ?? "").trim(),
      qty: Number(raw.qty ?? raw.quantity ?? 0),
      unit: raw.unit ?? "pcs",
      category: raw.category ?? "Pantry",
      location: raw.location ?? "Pantry",
      expiry: raw.expiry ?? raw.expiryDate ?? null,
      img: raw.img ?? raw.emoji ?? "🥫",
      status: raw.status ?? "ok",
      addedAt: raw.addedAt ?? Date.now(),
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
      lowThreshold:
        typeof raw.lowThreshold === "number" ? raw.lowThreshold : undefined,
      notes: raw.notes ?? "",
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      heatScore: typeof raw.heatScore === "number" ? raw.heatScore : 0,
      heatColor: raw.heatColor ?? "green",
      history: Array.isArray(raw.history) ? raw.history : [],
    };

    return base;
  });
}
