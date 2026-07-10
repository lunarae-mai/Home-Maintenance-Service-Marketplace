import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/top-nav";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Wrench, Star, ChevronRight, DollarSign, Clock } from "lucide-react";

export const Route = createFileRoute("/services/$categoryId")({
  component: CategoryDetails,
});

function CategoryDetails() {
  const { categoryId } = Route.useParams();
  const [subServices, setSubServices] = useState<any[]>([]);
  const [providersMap, setProvidersMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Fetch sub-services for this category
        const res = await api.get(`/Service/categories/${categoryId}/services`);
        if (res.data?.success) {
          const services = res.data.data;
          setSubServices(services);

          // Fetch providers for each sub-service
          const map: Record<string, any[]> = {};
          await Promise.all(
            services.map(async (service: any) => {
              try {
                const provRes = await api.get(`/Providers/search?serviceId=${service.id}`);
                if (provRes.data?.success) {
                  map[service.id] = provRes.data.data.items || [];
                } else {
                  map[service.id] = [];
                }
              } catch (err) {
                console.error(`Failed to fetch providers for service ${service.id}`);
                map[service.id] = [];
              }
            }),
          );
          setProvidersMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch category details.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopNav />
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground animate-pulse flex items-center gap-2">
            <Wrench className="h-5 w-5 animate-spin" />
            Loading services...
          </div>
        </div>
      </div>
    );
  }

  const categoryName = subServices.length > 0 ? subServices[0].categoryName : "Category Details";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{categoryName}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{categoryName} Services</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
            Select a specialized service below to view elite providers offering their expertise in
            this domain.
          </p>
        </div>

        {subServices.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No services found</h3>
            <p className="mt-2 text-muted-foreground">
              This category currently has no specialized services available.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {subServices.map((service) => {
              const providers = providersMap[service.id] || [];

              // We'll show the service priceModel/duration if available, otherwise fallback
              const basePriceLabel = service.priceModel === "Hourly" ? "Hourly Rate" : "Base Price";

              return (
                <div
                  key={service.id}
                  className="rounded-3xl border border-border bg-surface p-8 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{service.name}</h2>
                      <p className="mt-2 text-muted-foreground">
                        {service.description ||
                          "Professional service delivered by certified experts."}
                      </p>
                    </div>
                    <div className="flex gap-4 shrink-0">
                      <div className="flex flex-col items-end rounded-xl bg-primary/10 px-4 py-3 text-primary">
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          {basePriceLabel}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xl font-bold">
                            {service.basePrice || service.averageCost || "Varies"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end rounded-xl border border-border bg-background px-4 py-3 text-foreground">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Duration
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg font-semibold">
                            {service.duration || "60"} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Available Providers ({providers.length})
                  </h3>

                  {providers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No providers are currently available for this specific service.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {providers.map((provider) => (
                        <div
                          key={provider.providerId}
                          className="group flex flex-col sm:flex-row justify-between gap-4 rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-lg font-bold text-foreground">
                              {provider.providerName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground group-hover:text-primary transition">
                                {provider.providerName}
                              </h4>
                              <div className="mt-1.5 flex items-center gap-1.5 text-sm">
                                <div className="flex items-center text-cyan-500">
                                  <Star className="h-3.5 w-3.5 fill-cyan-500" />
                                  <span className="ml-1 font-medium">
                                    {provider.avgRating?.toFixed(1) || "New"}
                                  </span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">
                                  {provider.experience} yrs exp.
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {provider.bio}
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col justify-end items-center sm:items-end gap-3 shrink-0">
                            <Link
                              to="/providers/$serviceId"
                              params={{ serviceId: service.id.toString() }}
                              className="w-full sm:w-auto text-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
