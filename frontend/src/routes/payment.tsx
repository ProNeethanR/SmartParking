import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Wallet, Smartphone, Banknote, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/SiteLayout";
import { actions, useStore, type PaymentStatus } from "@/lib/parking-store";
import { toast } from "sonner";

export const Route = createFileRoute("/payment")({ component: PaymentPage });

const methods = [
  { id: "Card", label: "Credit/Debit Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "Wallet", label: "Wallet", icon: Wallet },
  { id: "Cash", label: "Cash", icon: Banknote },
];

const statusBadge = (s: PaymentStatus) => {
  if (s === "done") return { text: "Paid", icon: CheckCircle2, color: "var(--available)" };
  if (s === "failed") return { text: "Failed", icon: XCircle, color: "var(--occupied)" };
  return { text: "Waiting", icon: Clock, color: "oklch(0.65 0.16 90)" };
};

function PaymentPage() {
  const payments = useStore((s) => s.payments);
  const sessions = useStore((s) => s.sessions);
  const vehicles = useStore((s) => s.vehicles);
  const [method, setMethod] = useState("UPI");

  return (
    <>
      <PageHeader title="Payments" subtitle="Settle dues and review payment history." />

      {payments.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No payments yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => {
            const sess = sessions.find((s) => s.session_id === p.session_id);
            const v = sess && vehicles.find((x) => x.vehicle_id === sess.vehicle_id);
            const sb = statusBadge(p.payment_status);
            const Icon = sb.icon;
            return (
              <Card key={p.payment_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{v?.plate_number ?? "—"}</CardTitle>
                      <CardDescription>Session {p.session_id} · Slot {sess?.slot_id}</CardDescription>
                    </div>
                    <Badge className="gap-1" style={{ background: sb.color, color: "white" }}>
                      <Icon className="size-3" /> {sb.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Amount due</div>
                      <div className="text-3xl font-bold">₹{p.amount}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Method: <span className="font-medium text-foreground">{p.payment_method}</span></div>
                  </div>

                  {p.payment_status === "waiting" && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        {methods.map((m) => {
                          const MIcon = m.icon;
                          const active = method === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setMethod(m.id)}
                              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 text-xs transition ${active ? "border-primary bg-primary/5" : "border-border"}`}
                            >
                              <MIcon className="size-5" />
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                      <Button className="w-full" onClick={() => { actions.payNow(p.payment_id, method); toast.success("Payment successful"); }}>
                        Pay ₹{p.amount} via {method}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
