import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Car, Bell, CreditCard, ListChecks, MapPin, ShieldCheck, Tag, History, ScanLine } from "lucide-react";
import { useStore } from "@/lib/parking-store";

const nav = [
  { to: "/", label: "Register", icon: Car },
  { to: "/scan", label: "Scan QR", icon: ScanLine },
  { to: "/zones", label: "Zones", icon: MapPin },
  { to: "/rates", label: "Rates", icon: Tag },
  { to: "/session", label: "Session", icon: ListChecks },
  { to: "/payment", label: "Payment", icon: CreditCard },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/history", label: "History", icon: History },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

export function SiteLayout() {
  const loc = useLocation();
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b bg-card/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="size-9 rounded-lg grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
              <Car className="size-5" />
            </div>
            <span className="text-lg tracking-tight">SmartPark</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                  {to === "/notifications" && unread > 0 && (
                    <span className="ml-1 text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">{unread}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="md:hidden border-t overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 w-max">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to;
              return (
                <Link key={to} to={to} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  <Icon className="size-3.5" /> {label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        SmartPark · Smart Parking Management Template
      </footer>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
