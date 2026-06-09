import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ScanLine, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/SiteLayout";
import { QrScanner, type QrScanResult } from "@/components/QrScanner";
import { actions } from "@/lib/parking-store";

export const Route = createFileRoute("/scan")({ component: ScanPage });

type ScanState = "scanning" | "registering" | "success" | "error";

function ScanPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ScanState>("scanning");
  const [scannedData, setScannedData] = useState<QrScanResult | null>(null);
  const [allottedSlot, setAllottedSlot] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const isRegistering = useRef(false);

  const handleScan = async (data: QrScanResult) => {
    // Prevent double-registration
    if (isRegistering.current) return;
    isRegistering.current = true;

    setScannedData(data);
    setState("registering");
    toast.info(`QR scanned — registering ${data.plate_number}…`);

    // Auto-register immediately using the proven /api/register_and_allot endpoint
    const result = await actions.registerAndAllot({
      owner_name: data.owner_name,
      plate_number: data.plate_number,
      vehicle_type: data.vehicle_type as any,
      special_category: data.special_category,
    });

    if ("error" in result) {
      toast.error(result.error);
      setErrorMsg(result.error);
      setState("error");
      isRegistering.current = false;
      return;
    }

    setAllottedSlot(result.slot?.slot_id ?? "—");
    setState("success");
    toast.success(`Slot ${result.slot?.slot_id} allotted to ${data.plate_number}!`);
    isRegistering.current = false;
  };

  const handleScanError = (message: string) => {
    toast.error(message);
  };

  const handleReset = () => {
    setScannedData(null);
    setAllottedSlot(null);
    setErrorMsg("");
    isRegistering.current = false;
    setState("scanning");
  };

  return (
    <>
      <PageHeader
        title="Scan QR Code"
        subtitle="Point your camera at the QR code — vehicle is registered automatically."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scanner Panel */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ScanLine className="size-5 text-primary" />
              <CardTitle>Camera</CardTitle>
            </div>
            <CardDescription>
              {state === "scanning"
                ? "Position the QR code within the frame — registration is automatic"
                : state === "registering"
                  ? "QR detected — registering vehicle…"
                  : "Scanner paused"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-4 px-4">
            <QrScanner
              onScan={handleScan}
              onError={handleScanError}
              scanning={state === "scanning"}
            />
          </CardContent>
        </Card>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Scanning state */}
          {state === "scanning" && (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="qr-pulse-ring mx-auto mb-4">
                  <ScanLine className="size-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Waiting for QR code…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vehicle will be registered automatically on scan
                </p>
              </CardContent>
            </Card>
          )}

          {/* Registering state */}
          {state === "registering" && scannedData && (
            <Card className="border-primary/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Registering Vehicle</CardTitle>
                  <Badge
                    style={{
                      background: "var(--gradient-hero)",
                      color: "white",
                      border: "none",
                    }}
                  >
                    QR Scanned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {scannedData.employee_id && (
                    <DetailRow label="Employee ID" value={scannedData.employee_id} />
                  )}
                  <DetailRow label="Owner Name" value={scannedData.owner_name} />
                  {scannedData.department && (
                    <DetailRow label="Department" value={scannedData.department} />
                  )}
                  <DetailRow label="Plate Number" value={scannedData.plate_number} />
                  <DetailRow label="Vehicle Type" value={scannedData.vehicle_type} />
                  {scannedData.model && (
                    <DetailRow label="Vehicle Model" value={scannedData.model} />
                  )}
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Loader2 className="size-5 text-primary animate-spin" />
                  <p className="text-sm font-medium">Allotting the best available slot…</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success state */}
          {state === "success" && scannedData && (
            <Card className="border-green-500/50">
              <CardContent className="py-8">
                <div className="text-center mb-6">
                  <div className="size-16 rounded-full bg-green-500/10 grid place-items-center mx-auto mb-4">
                    <CheckCircle2 className="size-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">Slot Allotted!</h3>
                  <p className="text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">{scannedData.plate_number}</span> → Slot{" "}
                    <span className="font-mono font-semibold text-foreground">{allottedSlot}</span>
                  </p>
                </div>

                <div className="grid gap-2 mb-6">
                  {scannedData.employee_id && (
                    <DetailRow label="Employee ID" value={scannedData.employee_id} />
                  )}
                  <DetailRow label="Owner" value={scannedData.owner_name} />
                  {scannedData.department && (
                    <DetailRow label="Department" value={scannedData.department} />
                  )}
                  <DetailRow label="Plate" value={scannedData.plate_number} />
                  <DetailRow label="Type" value={scannedData.vehicle_type} />
                  {scannedData.model && (
                    <DetailRow label="Model" value={scannedData.model} />
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={handleReset} variant="outline" className="gap-2">
                    <RotateCcw className="size-4" />
                    Scan Another
                  </Button>
                  <Button onClick={() => navigate({ to: "/session" })} className="gap-2">
                    View Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {state === "error" && scannedData && (
            <Card className="border-destructive/50">
              <CardContent className="py-8">
                <div className="text-center mb-6">
                  <p className="font-medium text-destructive">Registration Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {errorMsg || "No slots available or a server error occurred."}
                  </p>
                </div>

                <div className="grid gap-2 mb-6">
                  <DetailRow label="Owner" value={scannedData.owner_name} />
                  <DetailRow label="Plate" value={scannedData.plate_number} />
                  <DetailRow label="Type" value={scannedData.vehicle_type} />
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={handleReset} variant="outline" className="gap-2">
                    <RotateCcw className="size-4" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium font-mono">{value}</span>
    </div>
  );
}
