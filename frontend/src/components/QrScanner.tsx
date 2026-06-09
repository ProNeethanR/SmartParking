import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { SwitchCamera, VideoOff, Video } from "lucide-react";

export interface QrScanResult {
  owner_name: string;
  plate_number: string;
  vehicle_type: string;
  special_category?: string;
  employee_id?: string;
  department?: string;
  model?: string;
}

interface QrScannerProps {
  onScan: (data: QrScanResult) => void;
  onError?: (message: string) => void;
  scanning?: boolean;
}

const SCANNER_REGION_ID = "qr-scanner-region";

export function QrScanner({ onScan, onError, scanning = true }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const hasScannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    try {
      if (
        scannerRef.current &&
        scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING
      ) {
        await scannerRef.current.stop();
      }
    } catch {
      // ignore stop errors
    }
    setCameraActive(false);
  }, []);

  const startScanner = useCallback(async () => {
    hasScannedRef.current = false;

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(SCANNER_REGION_ID);
    } else {
      // If already scanning, stop first
      try {
        if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore
      }
    }

    try {
      await scannerRef.current.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          try {
            const parsed = JSON.parse(decodedText);

            // Support both formats:
            // Friend's QR: { name, vehicle_number, vehicle_type: "Car", employee_id, department, model }
            // Our format:  { owner_name, plate_number, vehicle_type: "4-wheeler", special_category }
            const ownerName = parsed.owner_name || parsed.name;
            const plateNumber = parsed.plate_number || parsed.vehicle_number;

            if (!plateNumber || !ownerName) {
              throw new Error("Missing required fields");
            }

            // Map vehicle_type: "Car" → "4-wheeler", "Bike"/"Scooter" → "2-wheeler"
            let vehicleType = parsed.vehicle_type || "4-wheeler";
            const vt = vehicleType.toLowerCase();
            if (vt === "car" || vt === "suv" || vt === "sedan" || vt === "hatchback") {
              vehicleType = "4-wheeler";
            } else if (vt === "bike" || vt === "scooter" || vt === "motorcycle") {
              vehicleType = "2-wheeler";
            }

            onScan({
              owner_name: ownerName,
              plate_number: plateNumber,
              vehicle_type: vehicleType,
              special_category: parsed.special_category || "None",
              employee_id: parsed.employee_id,
              department: parsed.department,
              model: parsed.model,
            });
          } catch (e: any) {
            if (e?.message === "Missing required fields") {
              onError?.("Invalid QR: missing name/vehicle_number. Ensure the QR contains valid vehicle data.");
            } else {
              onError?.("Could not read QR code. Expected JSON with vehicle details.");
            }
            hasScannedRef.current = false;
          }
        },
        () => {
          // QR code not found in frame — ignore
        }
      );
      setCameraActive(true);
      setPermissionDenied(false);
    } catch (err: any) {
      console.error("Camera start error:", err);
      if (err?.toString?.()?.includes("NotAllowedError") || err?.toString?.()?.includes("Permission")) {
        setPermissionDenied(true);
        onError?.("Camera permission denied. Please allow camera access in your browser settings.");
      } else {
        onError?.(`Could not start camera: ${err?.message || err}`);
      }
      setCameraActive(false);
    }
  }, [facingMode, onScan, onError]);

  useEffect(() => {
    if (scanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [scanning, startScanner, stopScanner]);

  const toggleCamera = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // When facingMode changes, restart scanner
  useEffect(() => {
    if (scanning && !hasScannedRef.current) {
      startScanner();
    }
  }, [facingMode]);

  return (
    <div className="qr-scanner-wrapper">
      {/* Camera viewport */}
      <div className="qr-scanner-viewport">
        <div id={SCANNER_REGION_ID} className="qr-scanner-region" />

        {cameraActive && (
          <div className="qr-scanner-overlay">
            <div className="qr-scanner-frame">
              <span className="qr-corner qr-corner-tl" />
              <span className="qr-corner qr-corner-tr" />
              <span className="qr-corner qr-corner-bl" />
              <span className="qr-corner qr-corner-br" />
            </div>
            <p className="qr-scanner-hint">Align QR code within the frame</p>
          </div>
        )}

        {permissionDenied && (
          <div className="qr-scanner-denied">
            <VideoOff className="size-12 text-destructive mb-3" />
            <p className="text-sm font-medium text-destructive">Camera Access Denied</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] text-center">
              Please allow camera access in your browser settings and reload the page.
            </p>
          </div>
        )}

        {!cameraActive && !permissionDenied && scanning && (
          <div className="qr-scanner-loading">
            <div className="qr-scanner-spinner" />
            <p className="text-sm text-muted-foreground mt-3">Starting camera…</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="qr-scanner-controls">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCamera}
          disabled={!cameraActive}
          className="gap-2"
        >
          <SwitchCamera className="size-4" />
          Flip Camera
        </Button>
        <Button
          variant={cameraActive ? "destructive" : "default"}
          size="sm"
          onClick={cameraActive ? stopScanner : startScanner}
          className="gap-2"
        >
          {cameraActive ? <VideoOff className="size-4" /> : <Video className="size-4" />}
          {cameraActive ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}
