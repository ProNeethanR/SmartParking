import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/SiteLayout";
import { actions, useStore } from "@/lib/parking-store";
import { toast } from "sonner";

export const Route = createFileRoute("/session")({ component: SessionPage });

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function SessionPage() {
  const sessions = useStore((s) => s.sessions);
  const vehicles = useStore((s) => s.vehicles);
  const owners = useStore((s) => s.owners);

  const active = sessions.filter((s) => s.status === "active");
  const past = sessions.filter((s) => s.status === "completed");

  const end = (id: string) => {
    actions.endSession(id);
    toast.success("Session ended. Check Payment page.");
  };

  return (
    <>
      <PageHeader title="Parking Sessions" subtitle="Live entry/exit log for every parked vehicle." />

      {sessions.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground mb-4">No sessions yet.</p>
            <Button asChild><Link to="/">Register a vehicle</Link></Button>
          </CardContent>
        </Card>
      )}

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Active</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {active.map((s) => {
              const v = vehicles.find((x) => x.vehicle_id === s.vehicle_id)!;
              const o = owners.find((x) => x.owner_id === v.owner_id)!;
              return (
                <Card key={s.session_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{v.plate_number}</CardTitle>
                        <CardDescription>{o.owner_name} · {v.vehicle_type}</CardDescription>
                      </div>
                      <Badge style={{ background: "var(--available)", color: "white" }}>Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Session ID</span><span className="font-mono">{s.session_id}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Slot</span><span className="font-mono">{s.slot_id}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Entry</span><span>{fmt(s.entry_time)}</span></div>
                    <Button variant="destructive" className="w-full mt-3" onClick={() => end(s.session_id)}>End Session</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Completed</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {past.map((s) => {
              const v = vehicles.find((x) => x.vehicle_id === s.vehicle_id);
              return (
                <Card key={s.session_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{v?.plate_number}</CardTitle>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Slot</span><span className="font-mono">{s.slot_id}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Entry</span><span>{fmt(s.entry_time)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Exit</span><span>{fmt(s.leaving_time)}</span></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
