import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Star, ChevronRight, User, Award, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/services/$serviceId/providers")({
  component: ServiceProvidersPage,
  head: () => ({ meta: [{ title: "Providers — Home Services" }] }),
});

function ServiceProvidersPage() {
  const { serviceId } = Route.useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch service and providers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const srvRes = await api.get(`/Service/${serviceId}`);
        if (srvRes.data.success) {
          setService(srvRes.data.data);
        }

        const provRes = await api.get(`/Providers/search?serviceId=${serviceId}`);
        if (provRes.data.success) {
          setProviders(
            provRes.data.data.items.map((p: any) => ({
              id: p.providerId.toString(),
              name: p.providerName,
              rating: p.avgRating || 5.0,
              bio: p.bio || "No professional bio provided yet.",
              hourly: p.basePrice || 50,
              experience: p.experience || 2,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load providers or service details.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopNav />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-650 dark:text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4">
          <Link to="/services" className="hover:text-violet-650 dark:hover:text-violet-400 transition">
            Services
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700 dark:text-slate-300">{service?.name || "Providers"}</span>
        </nav>

        {/* Title Block */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white leading-tight">
            Available Specialists for <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">{service?.name || "Service"}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 max-w-3xl">
            Compare rates, client ratings, and reserve specialized professionals instantly. Select a profile below to browse schedule availability.
          </p>
        </div>

        {providers.length === 0 ? (
          <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
            <User className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-805 dark:text-white">No registered providers</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-450">
              There are currently no specialists registered for this service in your area.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((p) => {
              return (
                <div
                  key={p.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-extrabold text-lg shadow-lg shadow-violet-500/10 uppercase">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 leading-tight">
                          {p.name}
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-black text-violet-650 dark:text-cyan-400">
                            <Award className="h-3 w-3" /> {p.experience} yrs exp
                          </span>
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                          <div className="flex items-center text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="ml-1 font-bold">{p.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-slate-350 dark:text-slate-650">•</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Starting at ${p.hourly}/hr</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
                          {p.bio}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                      <Link
                        to="/providers/$providerId"
                        params={{ providerId: p.id }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 hover:border-violet-500/50 hover:text-violet-650 dark:hover:text-violet-400 dark:hover:border-violet-500/40 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 opacity-70" />
                        View Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/providers/$providerId/book",
                            params: { providerId: p.id },
                            search: { serviceId: String(serviceId), price: String(p.hourly) },
                          })
                        }
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                      >
                        Book Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
