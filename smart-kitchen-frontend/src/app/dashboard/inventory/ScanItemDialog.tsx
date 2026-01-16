// apps/web/src/app/dashboard/inventory/ScanItemDialog.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Sparkles, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { isMobileDevice } from "@/lib/is-mobile";

interface ScanItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUseSuggestion?: (aiName: string) => void;
}


export function ScanItemDialog({ isOpen, onClose }: ScanItemDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    name: string;
    qty: string;
    unit: string;
    expiry: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // decide device once on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // start camera only on mobile
  useEffect(() => {
    if (!isOpen) return;
    if (!isMobile) {
      setError(
        "Scan works best on mobile. Open this page on your phone to use the camera."
      );
      return;
    }

    const startCamera = async () => {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error(err);
        setError("Camera access denied or not available.");
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      setIsCameraReady(false);
      setSnapshotUrl(null);
      setScanResult(null);
      setIsProcessing(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isMobile]);

  const handleClose = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraReady(false);
    setSnapshotUrl(null);
    setScanResult(null);
    setIsProcessing(false);
    setError(null);
    onClose();
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSnapshotUrl(dataUrl);

    // Send image to backend vision API
    setIsProcessing(true);
    
    try {
      // Convert dataURL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'inventory-scan.jpg');

      // Send to OCR endpoint
      const ocrResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '')}/ocr/inventory`, {
        method: 'POST',
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error('Failed to process image');
      }

      const result = await ocrResponse.json();
      
      if (result.success && result.data) {
        setScanResult({
          name: result.data.name || "Unknown Item",
          qty: result.data.quantity?.toString() || "1.0",
          unit: result.data.unit || "piece",
          expiry: result.data.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
        });
      } else {
        throw new Error('Could not identify item');
      }
    } catch (error) {
      console.error('Image processing failed:', error);
      // Fallback to demo data
      setScanResult({
        name: "Scanned Item",
        qty: "1.0",
        unit: "piece",
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 bg-card/90">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="relative dialog-padding dialog-spacing bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-500 text-white">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 inline-flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>

                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/15 shadow-lg shadow-emerald-900/40">
                        <Camera className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-xl font-semibold tracking-tight">
                          Scan items
                        </h2>
                        <p className="text-[10px] sm:text-sm text-emerald-100">
                          Best experience on your phone&apos;s camera.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop-warning state */}
                  {!isMobile && (
                    <div className="dialog-padding dialog-spacing section-spacing">
                      <div className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/40 px-3 sm:px-4 py-3 sm:py-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                          <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-[10px] sm:text-base">
                            Open on your mobile device
                          </p>
                          <p className="text-[9px] sm:text-xs text-muted-foreground">
                            Scan uses the phone camera. Open this same URL on
                            your phone or scan it from the desktop to continue.
                          </p>
                        </div>
                      </div>
                      {error && (
                        <p className="text-[9px] sm:text-xs text-muted-foreground">{error}</p>
                      )}
                    </div>
                  )}

                  {/* Mobile camera UI */}
                  {isMobile && (
                    <>
                      {/* body */}
                      <div className="dialog-padding dialog-spacing section-spacing max-h-[calc(90vh-150px)] overflow-y-auto">
                        <div className="space-y-2">
                          <Label className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            Live camera
                          </Label>
                          <div className="aspect-video rounded-2xl border border-border/70 bg-black/60 overflow-hidden flex items-center justify-center relative">
                            {error && (
                              <p className="px-3 text-center text-[9px] sm:text-xs text-muted-foreground">
                                {error}
                              </p>
                            )}
                            {!error && (
                              <video
                                ref={videoRef}
                                className="h-full w-full object-cover"
                                autoPlay
                                playsInline
                                muted
                              />
                            )}
                            {!isCameraReady && !error && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2 text-[9px] sm:text-xs text-muted-foreground">
                                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-emerald-400/40 border-t-transparent animate-spin" />
                                  <span>Initializing camera…</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between gap-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleCapture}
                              disabled={!isCameraReady || !!error}
                              className="flex-1 h-8 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 text-[10px] sm:text-sm"
                            >
                              <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Capture frame
                            </Button>
                          </div>
                          <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* Result panel (same as earlier mock) */}
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                            AI suggestion (demo)
                          </Label>

                          {snapshotUrl && (
                            <div className="rounded-xl border border-border/70 bg-muted/40 overflow-hidden">
                              <img
                                src={snapshotUrl}
                                alt="Captured snapshot"
                                className="w-full max-h-32 sm:max-h-40 object-cover"
                              />
                            </div>
                          )}

                          {isProcessing && (
                            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border/60 bg-muted/60 px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-sm">
                              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 border-emerald-500/40 border-t-transparent animate-spin" />
                              <div>
                                <p className="font-medium">Analyzing image…</p>
                                <p className="text-[9px] sm:text-[11px] text-muted-foreground">
                                  Detecting item name, quantity and expiry.
                                </p>
                              </div>
                            </div>
                          )}

                          {!isProcessing && scanResult && (
                            <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 px-2 sm:px-4 py-2 sm:py-4 text-[10px] sm:text-sm">
                              <p className="font-semibold flex items-center gap-2">
                                <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[8px] sm:text-xs">
                                  AI
                                </span>
                                Suggested item
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-muted-foreground text-[9px] sm:text-[11px]">
                                    Name
                                  </p>
                                  <p className="font-semibold truncate">
                                    {scanResult.name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-[9px] sm:text-[11px]">
                                    Quantity
                                  </p>
                                  <p className="font-semibold">
                                    {scanResult.qty} {scanResult.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-[9px] sm:text-[11px]">
                                    Expiry
                                  </p>
                                  <p className="font-semibold">
                                    {scanResult.expiry}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/40 dialog-padding dialog-spacing">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClose}
                      className="h-8 sm:h-10 text-[10px] sm:text-sm"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!scanResult}
                      className="h-8 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 text-[10px] sm:text-sm"
                    >
                      Use suggestion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
