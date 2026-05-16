import { createFileRoute } from "@tanstack/react-router";
import { Bike, Car, Accessibility } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/SiteLayout";
import { useStore } from "@/lib/parking-store";

export const Route = createFileRoute("/rates")({ component: RatesPage });

const icons = { "2-wheeler": Bike, "4-wheeler": Car, disabled: Accessibility } as const;

function RatesPage() {
  const rates = useStore((s) => s.rates);
  return (
    <>
      <PageHeader title="Parking Rates" subtitle="Hourly pricing — bigger vehicles cost more." />
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {rates.map((r) => {
          const Icon = icons[r.vehicle_type];
          return (
            <Card key={r.rate_id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="size-12 rounded-lg bg-primary/10 grid place-items-center">
                  <Icon className="size-6 text-primary" />
                </div>
                <CardTitle>{r.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">₹{r.hourly_rate}<span className="text-base font-normal text-muted-foreground">/hr</span></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Rate Details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rate ID</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead className="text-right">Hourly Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((r) => (
                <TableRow key={r.rate_id}>
                  <TableCell className="font-mono text-xs">{r.rate_id}</TableCell>
                  <TableCell className="capitalize">{r.vehicle_type}</TableCell>
                  <TableCell className="text-right font-medium">₹{r.hourly_rate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
