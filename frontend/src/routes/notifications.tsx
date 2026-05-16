import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/SiteLayout";
import { actions, useStore } from "@/lib/parking-store";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const notifs = useStore((s) => s.notifications);
  const vehicles = useStore((s) => s.vehicles);

  return (
    <>
      <PageHeader title="Notifications" subtitle="Alerts when your session is about to end or any update happens." />
      {notifs.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">You're all caught up.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => {
            const v = vehicles.find((x) => x.vehicle_id === n.vehicle_id);
            const Icon = n.read ? Bell : BellRing;
            return (
              <Card key={n.notification_id} className={n.read ? "opacity-70" : ""}>
                <CardContent className="py-4 flex items-start gap-4">
                  <div className={`size-10 rounded-full grid place-items-center shrink-0 ${n.read ? "bg-muted" : "bg-primary/10"}`}>
                    <Icon className={`size-5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {v?.plate_number ?? "System"} · {new Date(n.sent_time).toLocaleString()}
                    </div>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => actions.markRead(n.notification_id)}>Mark read</Button>
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
