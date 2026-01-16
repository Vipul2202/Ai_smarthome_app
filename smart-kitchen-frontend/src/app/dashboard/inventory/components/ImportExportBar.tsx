// components/ImportExportBar.tsx
"use client";

import { useRef, useState } from "react";
import { Download, UploadCloud, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  onExportJSON: () => void;
  onImportJSON: (text: string) => void;
};

export function ImportExportBar({ onExportJSON, onImportJSON }: Props) {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePasteAndImport = () => {
    if (!rawText.trim()) return;
    onImportJSON(rawText);
    setRawText("");
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImportJSON(reader.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mobile-btn-sm rounded-lg sm:rounded-xl text-[10px] sm:text-sm"
          onClick={onExportJSON}
        >
          <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
          Export
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mobile-btn-sm rounded-lg sm:rounded-xl text-[10px] sm:text-sm"
          onClick={() => setOpen(true)}
        >
          <UploadCloud className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
          Import
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Import inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Paste exported JSON from this app, or upload a <code>.json</code> file.
            </p>

            <Textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder='{"items":[...]} or plain array of items'
              className="text-xs sm:text-sm"
            />

            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
              <button
                type="button"
                className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setRawText(text);
                  } catch {
                    // ignore
                  }
                }}
              >
                <ClipboardPaste className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Paste from clipboard
              </button>

              <button
                type="button"
                className="underline-offset-2 hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                Or choose JSON file
              </button>
            </div>
          </div>
          <DialogFooter className="mt-3">
            <Button variant="outline" className="mobile-btn-sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="mobile-btn-sm" onClick={handlePasteAndImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
