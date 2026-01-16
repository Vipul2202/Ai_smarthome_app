"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type QuickAddForm = {
  name: string;
  qty: string;       // from input
  unit: string;
  category?: string;
  location?: string;
  emoji?: string;
  expiry: string;  // ISO date string
};


export function QuickAddDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: QuickAddForm) => void;
}) {
  const [form, setForm] = useState<QuickAddForm>({
    name: "",
    qty: "",
    unit: "pcs",
    location: "Pantry",
    expiry: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.qty) return;

    onAdd(form);
    onClose();

    setForm({
      name: "",
      qty: "",
      unit: "pcs",
      location: "Pantry",
      expiry: new Date().toISOString().slice(0, 10),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 bg-card/90">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Quick add item</h2>
              <p className="text-xs text-muted-foreground">
                Just name, quantity, location and expiry.
              </p>
            </div>

            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                placeholder="Tomatoes, Milk..."
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Quantity</label>
                <Input
                  type="number"
                  min={0}
                  value={form.qty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, qty: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  className="h-9 w-full rounded-md border px-2 text-sm"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="pack">pack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Location</label>
                <select
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="h-9 w-full rounded-md border px-2 text-sm"
                >
                  <option value="Fridge">Fridge</option>
                  <option value="Freezer">Freezer</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Counter">Counter</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Expiry</label>
                <Input
                  type="date"
                  value={form.expiry}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiry: e.target.value }))
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!form.name || !form.qty}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
            >
              Add to inventory
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
