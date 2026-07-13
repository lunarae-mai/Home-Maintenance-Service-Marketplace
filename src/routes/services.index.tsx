import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/top-nav";
import { Wrench, Loader2 } from "lucide-react";
import api from "@/lib/api";

import { z } from "zod";

export const Route = createFileRoute("/services/")({
  component: Marketplace,
  validateSearch: z.object({
    category: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Marketplace — Home Services" }] }),
});

function getServiceFallbackDescription(serviceName: string) {
  const name = serviceName.toLowerCase();

  if (name.includes("carpet")) {
    return "Refresh carpets with deep cleaning that lifts dirt, stains, and odors.";
  }

  if (name.includes("ceiling") || name.includes("fan")) {
    return "Install and maintain ceiling fans with safe, efficient workmanship.";
  }

  if (name.includes("plumb") || name.includes("drain") || name.includes("water")) {
    return "Handle leaks, repairs, and installations with dependable plumbing expertise.";
  }

  if (name.includes("elect") || name.includes("wiring")) {
    return "Provide safe electrical repairs and installations for your home.";
  }

  if (name.includes("paint")) {
    return "Refresh interiors or exteriors with precise, clean painting services.";
  }

  if (name.includes("clean")) {
    return "Keep your space spotless with reliable cleaning and upkeep.";
  }

  if (name.includes("repair") || name.includes("fix")) {
    return "Restore fixtures and equipment with skilled, dependable repair work.";
  }

  if (name.includes("install") || name.includes("mount")) {
    return "Handle installations with professional care and attention to detail.";
  }

  if (name.includes("handyman")) {
    return "Tackle everyday maintenance jobs quickly and professionally.";
  }

  if (name.includes("ac") || name.includes("hvac") || name.includes("cool")) {
    return "Keep your home comfortable with efficient climate-control maintenance and repair.";
  }

  if (name.includes("pest")) {
    return "Protect your space with safe, effective pest-control solutions.";
  }

  return `${serviceName} delivered by trusted local experts with reliable, high-quality workmanship.`;
}

function Marketplace() {
  const search = Route.useSearch();
  console.log("URL SEARCH PARAM:", search);

  const [selected, setSelected] = useState<string[]>(search.category ? [search.category] : []);
  const [availability, setAvailability] = useState<string>("any");
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Availability slots checking states
  const [availableServiceIds, setAvailableServiceIds] = useState<string[]>([]);
  const [filteringAvailability, setFilteringAvailability] = useState(false);

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
              description: s.description?.trim() || "",
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

  // Effect to perform live slots checking when availability filter changes
  useEffect(() => {
    if (availability === "any" || services.length === 0) {
      setAvailableServiceIds([]);
      return;
    }

    const checkAvailability = async () => {
      setFilteringAvailability(true);
      try {
        const activeIds: string[] = [];
        const targetDates: string[] = [];
        const today = new Date();

        if (availability === "today") {
          targetDates.push(today.toISOString().split("T")[0]);
        } else if (availability === "week") {
          for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            targetDates.push(d.toISOString().split("T")[0]);
          }
        } else if (availability === "weekend") {
          for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            const day = d.getDay();
            if (day === 0 || day === 6) {
              targetDates.push(d.toISOString().split("T")[0]);
            }
          }
        }

        // Verify each service in parallel
        await Promise.all(
          services.map(async (s) => {
            try {
              const provRes = await api.get(`/Providers/search?serviceId=${s.id}`);
              if (provRes.data.success && provRes.data.data && provRes.data.data.items && provRes.data.data.items.length > 0) {
                const providersList = provRes.data.data.items;

                let hasSlot = false;
                for (const provider of providersList) {
                  for (const dateStr of targetDates) {
                    const slotRes = await api.get(`/Slots/${provider.providerId}?date=${dateStr}`);
                    if (slotRes.data.success && slotRes.data.data && slotRes.data.data.length > 0) {
                      hasSlot = true;
                      break;
                    }
                  }
                  if (hasSlot) break;
                }

                if (hasSlot) {
                  activeIds.push(s.id);
                }
              }
            } catch (err) {
              console.error(`Failed to check availability for service ${s.id}`, err);
            }
          })
        );

        setAvailableServiceIds(activeIds);
      } catch (err) {
        console.error("Error checking availability:", err);
      } finally {
        setFilteringAvailability(false);
      }
    };

    checkAvailability();
  }, [availability, services]);

  const filtered = useMemo(() => {
    let result = services;

    if (selected.length) {
      result = result.filter((s) => selected.includes(s.category));
    }

    if (availability !== "any") {
      result = result.filter((s) => availableServiceIds.includes(s.id));
    }

    return result;
  }, [selected, services, availability, availableServiceIds]);

  const toggle = (c: string) =>
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-605 dark:text-violet-400">
            Marketplace
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            All services, one trusted network
          </h1>
          <p className="mt-2 max-w-2xl text-slate-550 dark:text-slate-400">
            Browse vetted specialists across plumbing, electrical, cleaning, painting, and more.
            Book in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filter sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-in fade-in duration-200">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Categories
            </h3>
            <div className="space-y-1.5">
              {categories.map((c) => (
                <label
                  key={c}
                  className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-355 font-medium hover:text-violet-650 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1.5 rounded transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(c)}
                    onChange={() => toggle(c)}
                    className="h-4 w-4 accent-violet-600 dark:accent-violet-500 text-violet-600 focus:ring-violet-500 rounded"
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="my-5 h-px bg-slate-200 dark:bg-slate-800" />

            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Availability
            </h3>
            <div className="space-y-1.5">
              {[
                { v: "any", l: "Any time" },
                { v: "today", l: "Available today" },
                { v: "week", l: "This week" },
                { v: "weekend", l: "Weekends" },
              ].map((o) => (
                <label
                  key={o.v}
                  className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-355 font-medium hover:text-violet-605 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1.5 rounded transition-all duration-200"
                >
                  <input
                    type="radio"
                    name="avail"
                    checked={availability === o.v}
                    onChange={() => setAvailability(o.v)}
                    className="h-4 w-4 accent-violet-600 dark:accent-violet-500 text-violet-600 focus:ring-violet-555"
                  />
                  <span>{o.l}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Cards grid */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-450">
                Showing <span className="font-semibold text-slate-800 dark:text-slate-250">{filtered.length}</span>{" "}
                services
              </p>
            </div>

            {filteringAvailability ? (
              <div className="flex h-[35vh] flex-col items-center justify-center rounded-2xl border border-slate-250/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
                <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse">
                  Querying live schedule slots...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-[35vh] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm text-center">
                <Wrench className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-650 mb-3" />
                <p className="text-sm font-bold text-slate-850 dark:text-white">No services found</p>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  No active services match the selected category or schedule availability filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => {
                  const Icon = s.icon;
                  const descriptionText = s.description?.trim() || getServiceFallbackDescription(s.name);
                  return (
                    <div
                      key={s.id}
                      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-violet-100 dark:bg-violet-900/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                          {s.category}
                        </span>
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-cyan-500 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-800 dark:text-white">{s.name}</h3>
                      {descriptionText ? (
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                          {descriptionText}
                        </p>
                      ) : null}
                      <Link
                        to="/services/$serviceId/providers"
                        params={{ serviceId: s.id.toString() }}
                        className="mt-5 flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:from-violet-500 hover:to-cyan-400 py-2.5 text-sm font-semibold shadow hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      >
                        View Providers →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
