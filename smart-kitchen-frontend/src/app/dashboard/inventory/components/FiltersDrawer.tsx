"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type { InventoryFilters } from "../hooks/useFilters";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: InventoryFilters;
  setFilters: (f: InventoryFilters) => void;
  resetFilters: () => void;

  categories: string[];
  locations: string[];
  availableTags: string[];

  matchCount: number;
}

export function FiltersDrawer({
  open,
  onClose,
  filters,
  setFilters,
  resetFilters,
  categories,
  locations,
  availableTags,
  matchCount,
}: Props) {
  const update = (patch: Partial<InventoryFilters>) =>
    setFilters({ ...filters, ...patch });

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="p-4 sm:p-5 space-y-4 sm:space-y-6">
        <DrawerHeader>
          <h2 className="text-lg sm:text-xl font-bold">Filters</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Refine your inventory results
          </p>
        </DrawerHeader>

        {/* Quick Toggles */}
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={filters.lowStock ? "default" : "outline"}
              className="cursor-pointer text-xs sm:text-sm px-2 py-1"
              onClick={() => update({ lowStock: !filters.lowStock })}
            >
              Low Stock
            </Badge>
            <Badge
              variant={filters.expiringSoon ? "default" : "outline"}
              className="cursor-pointer text-xs sm:text-sm px-2 py-1"
              onClick={() => update({ expiringSoon: !filters.expiringSoon })}
            >
              Expiring Soon
            </Badge>
            <Badge
              variant={filters.expired ? "default" : "outline"}
              className="cursor-pointer text-xs sm:text-sm px-2 py-1"
              onClick={() => update({ expired: !filters.expired })}
            >
              Expired
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <p className="font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Categories</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={filters.categories.includes(cat) ? "default" : "outline"}
                className="cursor-pointer text-xs sm:text-sm px-2 py-1"
                onClick={() => {
                  const has = filters.categories.includes(cat);
                  update({
                    categories: has
                      ? filters.categories.filter((c) => c !== cat)
                      : [...filters.categories, cat],
                  });
                }}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <p className="font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Locations</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {locations.map((loc) => (
              <Badge
                key={loc}
                variant={filters.locations.includes(loc) ? "default" : "outline"}
                className="cursor-pointer text-xs sm:text-sm px-2 py-1"
                onClick={() => {
                  const has = filters.locations.includes(loc);
                  update({
                    locations: has
                      ? filters.locations.filter((l) => l !== loc)
                      : [...filters.locations, loc],
                  });
                }}
              >
                {loc}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Tags</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer text-xs sm:text-sm px-2 py-1"
                onClick={() => {
                  const has = filters.tags.includes(tag);
                  update({
                    tags: has
                      ? filters.tags.filter((t) => t !== tag)
                      : [...filters.tags, tag],
                  });
                }}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Heat Score */}
        <div>
          <p className="font-medium mb-1 text-sm sm:text-base">Heat Score</p>
          <Slider
            className="mt-2"
            value={filters.heatRange}
            max={100}
            step={1}
            onValueChange={(v) => update({ heatRange: v as [number, number] })}
          />
        </div>

        <DrawerFooter className="pt-3 sm:pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {matchCount} items match
            </p>
            <div className="flex gap-1.5 sm:gap-2">
              <Button variant="ghost" className="mobile-btn-sm" onClick={resetFilters}>
                Reset
              </Button>
              <Button onClick={onClose} className="mobile-btn-sm bg-emerald-500 text-white">
                Apply
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
