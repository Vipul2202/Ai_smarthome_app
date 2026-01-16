import { useState } from "react";

export interface InventoryFilters {
  lowStock: boolean;
  expiringSoon: boolean;
  expired: boolean;

  categories: string[];
  locations: string[];
  tags: string[];

  heatRange: [number, number]; // 0 – 100
  qtyRange: [number, number];

  sortPreset: "none" | "freshness" | "priority" | "stock";
}

export function useFilters() {
  const [filters, setFilters] = useState<InventoryFilters>({
    lowStock: false,
    expiringSoon: false,
    expired: false,

    categories: [],
    locations: [],
    tags: [],

    heatRange: [0, 100],
    qtyRange: [0, 1000],

    sortPreset: "none",
  });

  const resetFilters = () =>
    setFilters({
      lowStock: false,
      expiringSoon: false,
      expired: false,

      categories: [],
      locations: [],
      tags: [],

      heatRange: [0, 100],
      qtyRange: [0, 1000],

      sortPreset: "none",
    });

  return { filters, setFilters, resetFilters };
}
