import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, ShieldCheck, Activity, Home, DollarSign, Calendar, Zap } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — Home Services" }] }),
});

type Pending = { id: string; name: string; category: string; status: "REVIEW" | "APPROVED" | "REJECTED"; initials: string };

const INITIAL: Pending[] = [
  { id: "p1", name: "Alexander Vaughn", category: "Painting", status: "REVIEW", initials: "AV" },
  { id: "p2", name: "Flowline Plumbing", category: "Plumbing", status: "REVIEW", initials: "FP" },
  { id: "p3", name: "Voltaic Electrical", category: "Electrical", status: "REVIEW", initials: "VE" },
  { id: "p4", name: "Sparkline Cleaners", category: "Cleaning", status: "REVIEW", initials: "SC" },
  { id: "p5", name: "HandyPro Fixers", category: "General Repairs", status: "REVIEW", initials: "HP" },
];

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Providers", icon: Users },
  { label: "Verification", icon: ShieldCheck },
  { label: "System", icon: Activity },
];

const METRICS = [
  { label: "Transaction volume", value: "$248,120", sub: "+12.4% MoM", icon: DollarSign },
  { label: "Customer base", value: "8,412", sub: "+321 this week", icon: Users },
  { label: "Total bookings", value: "3,127", sub: "94% completion", icon: Calendar },
  { label: "System latency", value: "184ms", sub: "p95 stable", icon: Zap },
];

function AdminDashboard() {
  const [rows, setRows] = useState(INITIAL);

  const handleProviderApproval = async (providerId: string, statusAction: "APPROVED" | "REJECTED") => {
    try {
      await api.post(`/Providers/${providerId}/review`, { status: statusAction });
      setRows((prev) => prev.map((r) => (r.id === providerId ? { ...r, status: statusAction } : r)));
    } catch (err) {
      console.log("Failed to hit backend. Simulating approval.", { providerId, statusAction });
      setRows((prev) => prev.map((r) => (r.id === providerId ? { ...r, status: statusAction } : r)));
    }
  };

  useEffect(() => {
    const fetchPendingProviders = async () => {
      try {
        const res = await api.get("/User?role=Provider");
        if (res.data.success) {
          // You could map the returned users to the 'rows' state here if needed
        }
      } catch (err) {
        console.log("Using static data for admin panel.");
      }
    };
    fetchPendingProviders();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar p-4 lg:block">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-semibold">Admin Console</span>
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
      </aside>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-cyan-accent">Admin</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Home Maintenance Marketplace</h1>
            <p className="mt-1 text-sm text-muted-foreground">Global operational overview and provider verification.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {METRICS.map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{m.label}</p>
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight">{m.value}</p>
                <p className="mt-1 text-xs text-cyan-accent">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">Provider review pipeline</h2>
              <p className="text-sm text-muted-foreground">Onboard files awaiting validation.</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-cyan-accent text-xs font-bold text-primary-foreground">
                          {r.initials}
                        </div>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={r.status !== "REVIEW"}
                          onClick={() => handleProviderApproval(r.id, "APPROVED")}
                          className="rounded-md bg-cyan-accent px-3 py-1.5 text-xs font-semibold text-background transition hover:brightness-110 disabled:opacity-40"
                        >
                          APPROVE
                        </button>
                        <button
                          disabled={r.status !== "REVIEW"}
                          onClick={() => handleProviderApproval(r.id, "REJECTED")}
                          className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition hover:brightness-110 disabled:opacity-40"
                        >
                          REJECT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: "REVIEW" | "APPROVED" | "REJECTED" }) {
  const map = {
    REVIEW: "bg-warning/15 text-warning",
    APPROVED: "bg-success/15 text-success",
    REJECTED: "bg-destructive/15 text-destructive",
  } as const;
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider ${map[status]}`}>
      {status === "REVIEW" ? "In Review" : status}
    </span>
  );
}
