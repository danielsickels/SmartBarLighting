"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onError, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      if (!containerRef.current) return;

      try {
        const scanner = new Html5Qrcode("barcode-scanner", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
          ],
          verbose: false,
        });

        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 100 },
          },
          (decodedText) => {
            // Prevent duplicate scans
            if (decodedText !== lastScannedRef.current && mounted) {
              lastScannedRef.current = decodedText;
              onScan(decodedText);
            }
          },
          () => {
            // Ignore scan failures (normal during scanning)
          }
        );

        if (mounted) {
          setIsScanning(true);
          setErrorMessage(null);
        }
      } catch (err) {
        console.warn("Scanner error:", err);
        if (mounted) {
          const message = String(err).toLowerCase();
          if (message.includes("permission") || message.includes("not allowed")) {
            setErrorMessage("Camera permission denied. Please allow camera access.");
          } else if (message.includes("not found") || message.includes("no camera")) {
            setErrorMessage("No camera found. Please use a device with a camera.");
          } else {
            setErrorMessage("Could not start camera. Please try again.");
          }
          onError?.(errorMessage || "Scanner error");
        }
      }
    };

    // Small delay for DOM to be ready
    const timeout = setTimeout(startScanner, 150);

    return () => {
      mounted = false;
      clearTimeout(timeout);

      const scanner = scannerRef.current;
      if (scanner) {
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          scanner.stop().catch(() => {});
        }
        scannerRef.current = null;
      }
    };
  }, [onScan, onError]);

  const handleClose = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scanner.stop();
        }
      } catch {
        // Ignore
      }
      scannerRef.current = null;
    }
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
      <div className="relative bg-gray-900 rounded-xl overflow-hidden max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-amber-500">📷 Scan Barcode</h3>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white text-xl rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Scanner */}
        <div ref={containerRef} className="relative bg-black">
          <div id="barcode-scanner" className="w-full" />

          {/* Scanning indicator */}
          {isScanning && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1.5 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm">Scanning...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
              <div className="text-center">
                <div className="text-3xl mb-3">⚠️</div>
                <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Point camera at the barcode on the bottle
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
