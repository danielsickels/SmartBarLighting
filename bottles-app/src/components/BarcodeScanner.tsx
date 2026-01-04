"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

type CameraError = "no_camera" | "permission_denied" | "in_use" | "unknown";

const BarcodeScanner = ({ onScan, onError, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<CameraError | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const scannerContainerId = "barcode-scanner-container";

  // Parse error to determine the cause
  const parseError = (err: unknown): { type: CameraError; message: string } => {
    const errorStr = String(err).toLowerCase();
    
    if (errorStr.includes("timeout") || errorStr.includes("no video input") || errorStr.includes("requested device not found")) {
      return {
        type: "no_camera",
        message: "No camera detected. Please connect a camera or use a device with a camera."
      };
    }
    
    if (errorStr.includes("notallowederror") || errorStr.includes("permission denied") || errorStr.includes("not allowed")) {
      return {
        type: "permission_denied", 
        message: "Camera access was denied. Please allow camera permissions in your browser settings."
      };
    }
    
    if (errorStr.includes("notreadableerror") || errorStr.includes("in use") || errorStr.includes("could not start")) {
      return {
        type: "in_use",
        message: "Camera is being used by another application. Please close other apps using the camera."
      };
    }
    
    return {
      type: "unknown",
      message: "Unable to access camera. Please check your camera connection and permissions."
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Detect if we're likely on a mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    const startScanner = async () => {
      // Prevent multiple simultaneous start attempts
      if (isStartingRef.current || scannerRef.current) {
        return;
      }
      
      isStartingRef.current = true;

      try {
        const scanner = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });

        scannerRef.current = scanner;

        const scanConfig = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777,
        };

        const onScanSuccess = (decodedText: string) => {
          // Prevent duplicate scans
          if (decodedText !== lastScannedRef.current && isMountedRef.current) {
            lastScannedRef.current = decodedText;
            onScan(decodedText);
          }
        };

        const onScanFailure = () => {
          // Ignore scan failures (happens continuously while scanning)
        };

        // Try different camera selection strategies
        let started = false;

        // Strategy 1: On mobile devices, try facingMode: "environment" first (rear camera)
        if (isMobileDevice()) {
          try {
            await scanner.start(
              { facingMode: "environment" },
              scanConfig,
              onScanSuccess,
              onScanFailure
            );
            started = true;
          } catch {
            console.warn("facingMode 'environment' failed, trying fallback...");
          }
        }

        // Strategy 2: On desktop or if mobile strategy failed, enumerate cameras and use the first one
        if (!started) {
          try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              // Prefer cameras with "back" or "rear" in the label (for mobile fallback)
              // Otherwise use the first available camera (typical for desktop)
              const preferredCamera = cameras.find(
                (cam) => cam.label.toLowerCase().includes("back") || 
                         cam.label.toLowerCase().includes("rear") ||
                         cam.label.toLowerCase().includes("environment")
              ) || cameras[0];

              await scanner.start(
                preferredCamera.id,
                scanConfig,
                onScanSuccess,
                onScanFailure
              );
              started = true;
            }
          } catch (camErr) {
            console.warn("Camera enumeration/start failed:", camErr);
          }
        }

        // Strategy 3: Last resort - try without any constraint (let browser pick)
        if (!started) {
          try {
            await scanner.start(
              { facingMode: "user" },
              scanConfig,
              onScanSuccess,
              onScanFailure
            );
            started = true;
          } catch {
            console.warn("facingMode 'user' also failed");
          }
        }

        if (!started) {
          throw new Error("No camera could be started with any strategy");
        }

        if (isMountedRef.current) {
          setIsScanning(true);
          setCameraError(null); // Clear any previous errors
        }
      } catch (err) {
        // Use warn instead of error to avoid Next.js dev overlay for expected camera issues
        console.warn("Camera access issue:", err);
        if (isMountedRef.current) {
          const { type, message } = parseError(err);
          setCameraError(type);
          onError?.(message);
        }
      } finally {
        isStartingRef.current = false;
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(startScanner, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      
      // Cleanup scanner - only stop if it's actually running
      const scanner = scannerRef.current;
      if (scanner) {
        // Check if scanner is running before stopping
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          scanner.stop().catch(() => {
            // Ignore stop errors on unmount
          });
        }
        scannerRef.current = null;
      }
    };
  }, [onScan, onError]);

  const handleClose = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scanner.stop();
        }
      } catch {
        // Ignore stop errors
      }
    }
    scannerRef.current = null;
    setIsScanning(false);
    onClose();
  };

  // Handle touch events for iOS compatibility
  const handleTouchClose = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
      {/* Scanner container */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden max-w-lg w-full">
        {/* Header - z-20 ensures it stays above the scanner elements */}
        <div className="relative z-20 flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
          <h3 className="text-xl font-bold text-amber-500">
            📷 Scan Barcode
          </h3>
          <button
            onClick={handleClose}
            onTouchEnd={handleTouchClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white active:text-white active:bg-gray-700 text-2xl transition-colors rounded-lg touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Close scanner"
          >
            ✕
          </button>
        </div>

        {/* Scanner view - z-10 keeps it below the header */}
        <div className="relative z-10">
          {/* Container with strict containment to prevent library elements from overflowing */}
          <div
            id={scannerContainerId}
            className="w-full aspect-video bg-black"
            style={{ contain: 'layout', overflow: 'hidden' }}
          />

          {/* Scanning indicator */}
          {isScanning && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm">Scanning...</span>
              </div>
            </div>
          )}

          {/* Error messages */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center p-6 max-w-sm">
                {cameraError === "no_camera" && (
                  <>
                    <div className="text-4xl mb-4">📵</div>
                    <p className="text-red-400 font-medium mb-2">
                      No Camera Detected
                    </p>
                    <p className="text-gray-400 text-sm">
                      Please connect a camera or use a device with a camera (like a smartphone) to scan barcodes.
                    </p>
                  </>
                )}
                {cameraError === "permission_denied" && (
                  <>
                    <div className="text-4xl mb-4">🚫</div>
                    <p className="text-red-400 font-medium mb-2">
                      Camera Permission Denied
                    </p>
                    <p className="text-gray-400 text-sm">
                      Please allow camera access in your browser settings to scan barcodes.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Look for the camera icon in your browser&apos;s address bar
                    </p>
                  </>
                )}
                {cameraError === "in_use" && (
                  <>
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-yellow-400 font-medium mb-2">
                      Camera In Use
                    </p>
                    <p className="text-gray-400 text-sm">
                      Your camera is being used by another application. Please close other apps using the camera and try again.
                    </p>
                  </>
                )}
                {cameraError === "unknown" && (
                  <>
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-red-400 font-medium mb-2">
                      Camera Error
                    </p>
                    <p className="text-gray-400 text-sm">
                      Unable to access the camera. Please check your camera connection and browser permissions.
                    </p>
                  </>
                )}
                <button
                  onClick={handleClose}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions - z-20 ensures it stays above the scanner elements */}
        <div className="relative z-20 p-4 border-t border-gray-700 bg-gray-900">
          <p className="text-gray-400 text-sm text-center">
            Point your camera at a barcode on the bottle
          </p>
          <p className="text-gray-500 text-xs text-center mt-1">
            Supports UPC, EAN, Code 128, Code 39, and QR codes
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
