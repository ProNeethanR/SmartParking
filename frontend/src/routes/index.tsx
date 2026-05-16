import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bike, Car, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/SiteLayout";
import { actions, useStore, type VehicleType } from "@/lib/parking-store";

export const Route = createFileRoute("/")({ component: Index });

const vehicleOptions: { value: VehicleType; label: string; icon: typeof Bike; zone: string }[] = [
  { value: "2-wheeler", label: "2-Wheeler", icon: Bike, zone: "Zone A" },
  { value: "4-wheeler", label: "4-Wheeler", icon: Car, zone: "Zone B" },
  { value: "disabled", label: "Disabled", icon: Accessibility, zone: "Zone C" },
];

function Index() {
  const navigate = useNavigate();
  const slots = useStore((s) => s.slots);
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<VehicleType>("4-wheeler");
  const [special, setSpecial] = useState("");

  const counts = vehicleOptions.map((o) => ({
    ...o,
    available: slots.filter((s) => s.slot_category === o.value && s.status === "available").length,
    total: slots.filter((s) => s.slot_category === o.value).length,
  }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plate.trim()) return toast.error("Fill all fields");
    const result = await actions.registerAndAllot({
      owner_name: name.trim(),
      plate_number: plate.trim(),
      vehicle_type: type,
      special_category: special.trim() || undefined,
    });
    if ("error" in result) return toast.error(result.error);
    toast.success(`Slot ${result.slot.slot_id} allotted`);
    navigate({ to: "/session" });
  };

  return (
    <>
      <section className="rounded-2xl p-8 md:p-12 mb-10 text-primary-foreground" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-soft)" }}>
        <p className="text-sm uppercase tracking-widest opacity-80">Smart Parking</p>
        <h1 className="text-4xl md:text-5xl font-bold mt-2">Park smarter, not harder.</h1>
        <p className="mt-3 max-w-xl opacity-90">Register your vehicle and we'll auto-allot the right slot in the right zone.</p>
      </section>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {counts.map((o) => {
          const Icon = o.icon;
          return (
            <Card key={o.value}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{o.label}</CardTitle>
                  <CardDescription>{o.zone}</CardDescription>
                </div>
                <Icon className="size-8 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{o.available}<span className="text-base font-normal text-muted-foreground">/{o.total}</span></div>
                <p className="text-xs text-muted-foreground mt-1">slots available</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Registration</CardTitle>
          <CardDescription>Owner & vehicle information — we'll allot a slot automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Owner name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">Vehicle plate number</Label>
              <Input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="MH-12-AB-1234" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Vehicle type</Label>
              <div className="grid grid-cols-3 gap-3">
                {vehicleOptions.map((o) => {
                  const Icon = o.icon;
                  const active = type === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setType(o.value)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <Icon className={`size-7 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="text-sm font-medium">{o.label}</div>
                      <div className="text-xs text-muted-foreground">{o.zone}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="special">Special category (optional)</Label>
              <Input id="special" value={special} onChange={(e) => setSpecial(e.target.value)} placeholder="e.g. Senior citizen, Pregnant, Veteran" />
            </div>
            <Button type="submit" className="md:col-span-2 h-11 text-base">Register & Allot Slot</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
