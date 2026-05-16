import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/SiteLayout";
import { actions, useStore, ADMIN_HINT } from "@/lib/parking-store";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const loggedIn = useStore((s) => s.adminLoggedIn);
  return loggedIn ? <Dashboard /> : <Login />;
}

function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actions.adminLogin(u, p)) toast.error("Invalid credentials");
    else toast.success("Welcome, admin");
  };
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto size-14 rounded-xl bg-primary/10 grid place-items-center mb-2">
            <ShieldCheck className="size-7 text-primary" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>{ADMIN_HINT}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const statusStyle = (status: string, category: string) => {
  // disabled-zone slots colored blue regardless when available
  if (category === "disabled" && status !== "occupied") {
    return { bg: "var(--disabled-slot)", text: "white", label: "Disabled" };
  }
  if (status === "occupied") return { bg: "var(--occupied)", text: "white", label: "Occupied" };
  if (status === "booked") return { bg: "var(--booked)", text: "oklch(0.25 0.08 90)", label: "Booked" };
  return { bg: "var(--available)", text: "white", label: "Available" };
};

function Dashboard() {
  const slots = useStore((s) => s.slots);
  const zones = useStore((s) => s.zones);
  const owners = useStore((s) => s.owners);
  const vehicles = useStore((s) => s.vehicles);
  const sessions = useStore((s) => s.sessions);
  const payments = useStore((s) => s.payments);

  const stats = [
    { label: "Owners", value: owners.length },
    { label: "Vehicles", value: vehicles.length },
    { label: "Active Sessions", value: sessions.filter((s) => s.status === "active").length },
    { label: "Pending Payments", value: payments.filter((p) => p.payment_status === "waiting").length },
  ];

  return (
    <>
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <PageHeader title="Admin Dashboard" subtitle="Live overview of all parking slots and operations." />
        <Button variant="outline" onClick={() => actions.adminLogout()}><LogOut className="size-4 mr-2" />Sign out</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="text-3xl font-bold mt-1">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Slot Status — Color-Coded</CardTitle>
          <CardDescription className="flex flex-wrap gap-3 pt-2">
            <Legend color="var(--occupied)" label="Occupied" />
            <Legend color="var(--booked)" label="Booked" />
            <Legend color="var(--disabled-slot)" label="Disabled Slot" />
            <Legend color="var(--available)" label="Available" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {zones.map((z) => (
            <div key={z.zone_id}>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-semibold">{z.zone_name} <span className="text-xs text-muted-foreground capitalize">· {z.vehicle_type}</span></h3>
              </div>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                {slots.filter((s) => s.zone_id === z.zone_id).map((s) => {
                  const st = statusStyle(s.status, s.slot_category);
                  return (
                    <div
                      key={s.slot_id}
                      title={`${s.slot_id} — ${st.label}`}
                      className="aspect-square rounded-md grid place-items-center text-xs font-semibold cursor-default"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {s.slot_number}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
        <CardContent>
          {sessions.filter((s) => s.status === "active").length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No active sessions.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b">
                  <tr><th className="text-left py-2">Session</th><th className="text-left">Vehicle</th><th className="text-left">Owner</th><th className="text-left">Slot</th><th className="text-left">Entry</th></tr>
                </thead>
                <tbody>
                  {sessions.filter((s) => s.status === "active").map((s) => {
                    const v = vehicles.find((x) => x.vehicle_id === s.vehicle_id);
                    const o = owners.find((x) => x.owner_id === v?.owner_id);
                    return (
                      <tr key={s.session_id} className="border-b last:border-0">
                        <td className="py-2 font-mono text-xs">{s.session_id}</td>
                        <td>{v?.plate_number}</td>
                        <td>{o?.owner_name}</td>
                        <td className="font-mono">{s.slot_id}</td>
                        <td className="text-xs">{new Date(s.entry_time).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="size-3 rounded" style={{ background: color }} />
      {label}
    </span>
  );
}
