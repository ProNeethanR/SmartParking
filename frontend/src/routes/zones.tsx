import { createFileRoute } from "@tanstack/react-router";
import { Bike, Car, Accessibility } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/SiteLayout";
import { useStore } from "@/lib/parking-store";

export const Route = createFileRoute("/zones")({ component: ZonesPage });

const zoneIcon = { "2-wheeler": Bike, "4-wheeler": Car, disabled: Accessibility } as const;

function ZonesPage() {
  const zones = useStore((s) => s.zones);
  const slots = useStore((s) => s.slots);

  return (
    <>
      <PageHeader title="Parking Zones" subtitle="Three dedicated zones — each tuned for a specific vehicle category." />
      <div className="grid lg:grid-cols-3 gap-6">
        {zones.map((z) => {
          const zSlots = slots.filter((s) => s.zone_id === z.zone_id);
          const available = zSlots.filter((s) => s.status === "available").length;
          const Icon = zoneIcon[z.vehicle_type];
          return (
            <Card key={z.zone_id} className="overflow-hidden">
              <div className="h-2" style={{ background: "var(--gradient-hero)" }} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{z.zone_name}</CardTitle>
                    <CardDescription className="capitalize">For {z.vehicle_type}</CardDescription>
                  </div>
                  <Icon className="size-10 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">{available}</span>
                  <span className="text-muted-foreground">of {zSlots.length} available</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {zSlots.map((s) => (
                    <div
                      key={s.slot_id}
                      title={`${s.slot_id} — ${s.status}`}
                      className="aspect-square rounded text-[10px] grid place-items-center font-medium"
                      style={{
                        background:
                          s.status === "available"
                            ? "color-mix(in oklab, var(--available) 18%, transparent)"
                            : s.status === "occupied"
                            ? "color-mix(in oklab, var(--occupied) 18%, transparent)"
                            : "color-mix(in oklab, var(--booked) 22%, transparent)",
                        color:
                          s.status === "available"
                            ? "var(--available)"
                            : s.status === "occupied"
                            ? "var(--occupied)"
                            : "oklch(0.4 0.1 90)",
                      }}
                    >
                      {s.slot_number}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
