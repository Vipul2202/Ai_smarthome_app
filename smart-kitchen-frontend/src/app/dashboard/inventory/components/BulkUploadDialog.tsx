"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

type BulkRow = {
  name: string;
  qty: number;
  unit: string;
  location: string;
  expiry: string;
};


export function BulkUploadDialog({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (rows: BulkRow[]) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsParsing(true);
    setRows([]);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split(/\r?\n/).filter(Boolean);

        const data: BulkRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const [name, qtyStr, unit, location, expiry] = lines[i]
            .split(",")
            .map((x) => x.trim());

          if (!name) continue;

          const qty = Number(qtyStr || 0);
          data.push({
            name,
            qty: isNaN(qty) ? 0 : qty,
            unit: unit || "pcs",
            location: location || "Pantry",
            expiry: expiry || new Date().toISOString().slice(0, 10),
          });
        }

        setRows(data);
      } catch (err) {
        setError("Could not parse CSV. Format: name,qty,unit,location,expiry");
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleApply = () => {
    if (!rows.length) return;
    onApply(rows);
    onClose();
    setRows([]);
    setFileName("");
    setError(null);
    setIsParsing(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      <Card className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 bg-card/90">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-lg font-semibold">Bulk upload</h2>
              <p className="text-xs text-muted-foreground">
                Upload a CSV file to add or merge items.
              </p>
            </div>

            <Button size="icon-sm" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Upload box */}
          <label className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/40 px-6 py-6 cursor-pointer">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg text-white">
              <Upload className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Drop CSV or click to upload</p>
              <p className="text-[11px] text-muted-foreground">
                Required columns: name, qty, unit, location, expiry
              </p>
            </div>

            <Input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {fileName && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-300 truncate w-full text-center">
                {fileName}
              </p>
            )}
          </label>

          {isParsing && <p className="text-xs text-muted-foreground">Parsing…</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Preview rows */}
          {!!rows.length && (
            <div className="max-h-40 overflow-y-auto rounded-xl border bg-muted/30 text-xs">
              <table className="w-full">
                <thead className="bg-muted/70 sticky top-0">
                  <tr>
                    <th className="px-3 py-1.5">Name</th>
                    <th className="px-3 py-1.5">Qty</th>
                    <th className="px-3 py-1.5">Unit</th>
                    <th className="px-3 py-1.5">Location</th>
                    <th className="px-3 py-1.5">Expiry</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-border/40">
                      <td className="px-3 py-1.5">{r.name}</td>
                      <td className="px-3 py-1.5">{r.qty}</td>
                      <td className="px-3 py-1.5">{r.unit}</td>
                      <td className="px-3 py-1.5">{r.location}</td>
                      <td className="px-3 py-1.5">{r.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={!rows.length}
              onClick={handleApply}
            >
              Apply to inventory
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
