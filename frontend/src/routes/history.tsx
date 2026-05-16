import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/SiteLayout";
import { useStore } from "@/lib/parking-store";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const history = useStore((s) => s.history);
  const vehicles = useStore((s) => s.vehicles);

  return (
    <>
      <PageHeader title="Parking History" subtitle="Past sessions with entry/exit times and totals." />
      <Card>
        <CardHeader><CardTitle>All History</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No completed sessions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>History ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => {
                  const v = vehicles.find((x) => x.vehicle_id === h.vehicle_id);
                  return (
                    <TableRow key={h.history_id}>
                      <TableCell className="font-mono text-xs">{h.history_id}</TableCell>
                      <TableCell>{v?.plate_number ?? h.vehicle_id}</TableCell>
                      <TableCell className="font-mono">{h.slot_id}</TableCell>
                      <TableCell className="text-xs">{new Date(h.entry_time).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{new Date(h.exit_time).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">₹{h.total_cost}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
