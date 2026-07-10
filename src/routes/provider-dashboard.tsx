import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  CalendarCheck,
  Wallet,
  UserCog,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Home,
} from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/provider-dashboard")({
  component: ProviderDashboard,
});

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Analytics", icon: BarChart3 },
  { label: "Bookings", icon: CalendarCheck },
  { label: "Payments", icon: Wallet },
  { label: "Profile", icon: UserCog },
  { label: "Settings", icon: Settings },
];

type Booking = {
  id: number;
  customerId: string;
  serviceId: number;
  slotId: number;
  status: string;
  notes: string;
  customer?: any;
  service?: any;
  slot?: any;
};

const COLUMNS = ["Pending", "Confirmed", "InProgress", "Completed"];

function ProviderDashboard() {
  const [approved, setApproved] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerId, setProviderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfileAndBookings = async () => {
      try {
        const profRes = await api.get("/Providers/profile");
        if (profRes.data.success) {
          setApproved(true);
          const pId = profRes.data.data.id || 5; // using fallback ID if profile doesn't return id
          setProviderId(pId);

          // Fetch incoming and today schedule
          const [incoming, today] = await Promise.all([
            api.get(`/Booking/provider/${pId}/incoming-requests`),
            api.get(`/Booking/provider/${pId}/today-schedule`),
          ]);

          let allBookings: Booking[] = [];
          if (incoming.data.success) allBookings = [...allBookings, ...incoming.data.data];
          if (today.data.success) {
            // merge today without duplicates
            const existingIds = new Set(allBookings.map((b) => b.id));
            const newToday = today.data.data.filter((b: Booking) => !existingIds.has(b.id));
            allBookings = [...allBookings, ...newToday];
          }
          setBookings(allBookings);
        }
      } catch (err) {
        console.error("Could not load data from backend.", err);
      }
    };
    fetchProfileAndBookings();
  }, []);

  const changeStatus = async (id: number, action: "confirm" | "reject" | "start" | "complete") => {
    try {
      await api.put(`/Booking/${id}/${action}`);

      const newStatusMap: Record<string, string> = {
        confirm: "Confirmed",
        reject: "Rejected",
        start: "InProgress",
        complete: "Completed",
      };

      if (action === "reject") {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatusMap[action] } : b)),
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} booking`, err);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar p-4 lg:block">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-semibold">Home Services</span>
        </Link>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <a
              key={n.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                n.active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </a>
          ))}
        </nav>
        <div className="mt-8 rounded-lg border border-border bg-surface p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
          <p className={`mt-1 text-sm font-bold ${approved ? "text-success" : "text-warning"}`}>
            {approved ? "APPROVED" : "PENDING APPROVAL"}
          </p>
        </div>
      </aside>

      <main className="flex-1">
        {!approved && (
          <div className="border-b border-warning/30 bg-warning px-6 py-3 text-sm text-white">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="flex-1">
                <strong>Account Under Review</strong> - Your profile is undergoing admin
                verification.
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-accent">Overview</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Booking pipeline</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {COLUMNS.map((col) => {
              const items = bookings.filter((b) => b.status === col);
              return (
                <div key={col} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {col}
                    </h3>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {items.length === 0 && (
                      <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                        Empty
                      </p>
                    )}
                    {items.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-lg border border-border bg-surface-elevated p-3"
                      >
                        <p className="text-sm font-semibold">{b.customer?.name || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.service?.name || "Service"}
                        </p>
                        <p className="mt-1 text-xs text-cyan-accent">
                          {b.slot?.startTime || "TBD"}
                        </p>
                        {col === "Pending" && approved && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => changeStatus(b.id, "confirm")}
                              className="flex-1 rounded-md bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => changeStatus(b.id, "reject")}
                              className="flex-1 rounded-md border border-border py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {col === "Confirmed" && approved && (
                          <button
                            onClick={() => changeStatus(b.id, "start")}
                            className="mt-3 w-full rounded-md border border-cyan-accent py-1.5 text-xs font-semibold text-cyan-accent hover:bg-cyan-accent hover:text-background"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {col === "InProgress" && approved && (
                          <button
                            onClick={() => changeStatus(b.id, "complete")}
                            className="mt-3 w-full rounded-md border border-success py-1.5 text-xs font-semibold text-success hover:bg-success hover:text-white"
                          >
                            Complete Job
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
