"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type NewShoppingItem = {
  name: string;
  qty?: string;
  estimatedPrice?: number;
};

interface AddShoppingItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: NewShoppingItem) => void;
}

export function AddShoppingItemDialog({
  open,
  onClose,
  onAdd,
}: AddShoppingItemDialogProps) {
  const [form, setForm] = useState<NewShoppingItem>({
    name: "",
    qty: "",
    estimatedPrice: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd(form);
    onClose();
    setForm({ name: "", qty: "", estimatedPrice: undefined });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-md card-premium border-border/60 bg-card/90 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-lg font-semibold">Add item to list</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Add a single item with optional quantity.
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full h-6 w-6 sm:h-8 sm:w-8"
              onClick={onClose}
            >
              <span className="text-[10px] sm:text-sm">✕</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                Name
              </label>
              <input
                className="w-full h-8 sm:h-10 rounded-md border border-input bg-background px-3 text-[10px] sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                placeholder="Milk, Rice, Tomatoes..."
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                Quantity (optional)
              </label>
              <input
                className="w-full h-8 sm:h-10 rounded-md border border-input bg-background px-3 text-[10px] sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                placeholder="2L, 1kg, 3 packs..."
                value={form.qty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, qty: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                Estimated price (optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full h-8 sm:h-10 rounded-md border border-input bg-background px-3 text-[10px] sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                placeholder="e.g. 120"
                value={form.estimatedPrice ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estimatedPrice:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  }))
                }
              />
            </div>

            <Button
              type="submit"
              disabled={!form.name.trim()}
              className="w-full h-8 sm:h-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/40 text-[10px] sm:text-sm"
            >
              Add item
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
