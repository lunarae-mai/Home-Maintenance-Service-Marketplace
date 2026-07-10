import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/top-nav";
import { Wrench } from "lucide-react";
import api from "@/lib/api";

import { z } from "zod";

export const Route = createFileRoute("/services")({
  component: Marketplace,
  validateSearch: z.object({
    category: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Marketplace — Home Services" }] }),
});

function Marketplace() {
  const search = Route.useSearch();
  console.log("URL SEARCH PARAM:", search);

  const [selected, setSelected] = useState<string[]>(search.category ? [search.category] : []);
  const [availability, setAvailability] = useState<string>("any");
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catsRes = await api.get("/Service/categories");
        console.log("CATEGORIES API RESPONSE:", catsRes.data);
        if (catsRes.data.success) {
          setCategories(catsRes.data.data.map((c: any) => c.name));
        }

        const srvsRes = await api.get("/Service/search?pageSize=100");
        console.log("SERVICES API RESPONSE:", srvsRes.data);
        if (srvsRes.data.success) {
          setServices(
            srvsRes.data.data.items.map((s: any) => ({
              id: s.id.toString(),
              category: s.categoryName,
              name: s.name,
              description: s.description || "Professional service.",
              icon: Wrench,
            })),
          );
        }
      } catch (err) {
        console.error("API failed. Cannot load services without backend.", err);
      }
    };
    fetchData();
  }, []);

  

    const filtered = useMemo(() => {

        console.log("CURRENT SELECTED:", selected);

        console.log("ALL SERVICES:", services);

        const result = selected.length
            ? services.filter((s) => selected.includes(s.category))
            : services;

        console.log("FILTERED RESULT:", result);

        return result;

    }, [selected, services]);


  const toggle = (c: string) =>
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-cyan-accent">
            Marketplace
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            All services, one trusted network
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Browse vetted specialists across plumbing, electrical, cleaning, painting, and more.
            Book in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filter sidebar */}
          <aside className="h-fit rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((c) => (
                <label
                  key={c}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-background"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(c)}
                    onChange={() => toggle(c)}
                    className="h-4 w-4 accent-[oklch(0.63_0.22_300)]"
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="my-5 h-px bg-border" />

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Availability
            </h3>
            <div className="space-y-2">
              {[
                { v: "any", l: "Any time" },
                { v: "today", l: "Available today" },
                { v: "week", l: "This week" },
                { v: "weekend", l: "Weekends" },
              ].map((o) => (
                <label
                  key={o.v}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-background"
                >
                  <input
                    type="radio"
                    name="avail"
                    checked={availability === o.v}
                    onChange={() => setAvailability(o.v)}
                    className="h-4 w-4 accent-[oklch(0.63_0.22_300)]"
                  />
                  <span>{o.l}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Cards grid */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                services
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className="group flex flex-col rounded-2xl border border-border bg-surface-elevated p-5 transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-cyan-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-accent">
                        {s.category}
                      </span>
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight">{s.name}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                    <Link
                      to="/providers/$serviceId"
                      params={{ serviceId: s.id }}
                      className="mt-5 flex items-center justify-center rounded-lg border border-primary/50 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      View Providers →
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
