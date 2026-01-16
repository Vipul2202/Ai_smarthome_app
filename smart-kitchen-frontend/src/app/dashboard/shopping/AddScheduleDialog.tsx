"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (data: { date: string; note: string }) => void;
}

export function ScheduleDialog({ open, onClose, onSchedule }: ScheduleDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onSchedule({ date, note: note.trim() });
    onClose();
    setDate(today);
    setNote("");
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
              <h2 className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                </span>
                Schedule shopping
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Pick a date and add an optional note for this list.
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
                Date
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-8 sm:h-10 rounded-md border border-input bg-background px-3 text-[10px] sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                Note (optional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Groceries after salary, Diwali stock-up, weekend mall visit..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-[10px] sm:text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-8 sm:h-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/40 text-[10px] sm:text-sm"
            >
              Save schedule
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
