"use client";

import Image from "next/image";
import { FormEvent, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import type { ScanResult } from "@/types/ticket";

const QrScanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => ({ default: mod.Scanner })),
  { 
    ssr: false, 
    loading: () => <div className="p-6 text-center text-sm text-black/60 font-normal animate-pulse">Starting camera…</div> 
  }
);

export function Scanner() {
  const { pushToast } = useToast();
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const validateTicket = useCallback(
    async (value: string) => {
      if (!value) return;
      setLoading(true);

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticketNumber: value }),
        });

        const payload: ScanResult = await response.json();
        setResult(payload);

        pushToast({
          variant: payload.isValid ? "success" : "error",
          title: payload.isValid ? "Ticket valid" : "Ticket rejected",
          description: payload.message,
        });

        if (payload.isValid) {
          setTicketNumber("");
        }
      } catch (error) {
        pushToast({
          variant: "error",
          title: "Scanner unavailable",
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [pushToast]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await validateTicket(ticketNumber);
  };

  const handleScan = useCallback(
    async (detectedCodes: Array<{ rawValue: string }>) => {
      if (!detectedCodes || detectedCodes.length === 0 || loading) return;
      const data = detectedCodes[0]?.rawValue;
      if (!data || data === lastScan) return;
      setLastScan(data);
      setTicketNumber(data);
      await validateTicket(data);
    },
    [lastScan, loading, validateTicket]
  );

  const handleError = useCallback((err: unknown) => {
    console.error("[QrScanner] Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Camera error occurred";
    setCameraError(errorMessage);
  }, []);

  return (
    <Card
      title="Ticket scanner"
      description="Validate tickets instantly. Each ticket can only be used once."
      className="w-full max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Ticket number"
          placeholder="ABC123-XYZ9"
          value={ticketNumber}
          onChange={(event) => setTicketNumber(event.target.value)}
          required
        />
        <Button type="submit" loading={loading} fullWidth>
          Validate ticket
        </Button>
      </form>

      <div className="mt-6 space-y-3 rounded-xl border border-black/10 bg-black/5 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-normal text-black/60">
            Prefer scanning a QR? Open the camera below.
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setCameraActive((prev) => !prev);
              setCameraError(null);
            }}
          >
            {cameraActive ? "Close camera" : "Open camera"}
          </Button>
        </div>

        {cameraActive && (
          <div className="overflow-hidden rounded-xl border border-black/20 bg-black animate-in fade-in slide-in-from-bottom-4 shadow-modern">
            <div className="relative w-full" style={{ aspectRatio: '1 / 1', minHeight: '300px', backgroundColor: '#000' }}>
              <QrScanner
                onScan={handleScan}
                onError={handleError}
                constraints={{ facingMode: 'environment' }}
                scanDelay={300}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as const,
                  },
                }}
              />
            </div>
          </div>
        )}
        {cameraError && (
          <p className="text-xs text-black/60 font-normal">
            {cameraError}. Ensure the browser has camera permissions.
          </p>
        )}
      </div>

      {result && (
        <div
          className={`mt-6 rounded-xl border p-6 text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-modern ${
            result.isValid
              ? "border-black/20 bg-white/80 backdrop-blur-sm"
              : "border-black/10 bg-black/5"
          }`}
        >
          <p className={`font-semibold text-sm mb-4 ${
            result.isValid ? "text-black" : "text-black/60"
          }`}>{result.message}</p>
          {result.ticket && (
            <div className="mt-4 flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between border-t border-black/10 pt-4">
              <div className="space-y-2">
                <p className="text-black">
                  <span className="font-semibold text-xs">Ticket:</span>{" "}
                  <span className="font-mono font-semibold">{result.ticket.ticketNumber}</span>
                </p>
                <p className="text-black">
                  <span className="font-semibold text-xs">Attendee:</span>{" "}
                  {result.ticket.name}
                </p>
                <p className="text-black/60">
                  <span className="font-semibold text-xs">Mail:</span>{" "}
                  {result.ticket.mail}
                </p>
                <p className="text-black">
                  <span className="font-semibold text-xs">Status:</span>{" "}
                  <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                    result.ticket.isValid 
                      ? "border-black/20 bg-black/5 text-black" 
                      : "border-black/10 bg-black/5 text-black/40"
                  }`}>
                    {result.ticket.isValid ? "Valid" : "Already used"}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-lg border border-black/20 bg-white p-2 shadow-sm">
                  <Image
                    src={result.ticket.qrCodeDataUrl}
                    alt="QR preview"
                    width={64}
                    height={64}
                    className="h-16 w-16"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

