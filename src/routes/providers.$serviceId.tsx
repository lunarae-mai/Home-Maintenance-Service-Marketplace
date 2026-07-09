import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Star, ChevronRight } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/providers/$serviceId")({
  component: ProvidersList,
});

function ProvidersList() {
  const { serviceId } = Route.useParams();
  const [service, setService] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const res = await api.get(`/Service/${serviceId}`);
        if (res.data.success) {
          setService(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch service details.");
      }
    };
    fetchServiceDetails();
    const fetchProvidersForService = async () => {
      try {
        const res = await api.get(`/Providers/search?serviceId=${serviceId}`);
        if (res.data.success) {
          setProviders(res.data.data.items.map((p: any) => ({
            id: p.providerId.toString(),
            name: p.providerName,
            serviceId: serviceId,
            rating: p.avgRating,
            bio: p.bio,
            hourly: p.basePrice,
            expertise: [],
            description: p.bio
          })));
        }
      } catch (err) {
        console.error("Failed to fetch dynamic providers.", err);
      }
    };
    fetchProvidersForService();
  }, [serviceId]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{service?.name ?? serviceId}</span>
        </nav>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Providers for <span className="text-primary">{service?.name ?? serviceId}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {providers.length} vetted specialist{providers.length === 1 ? "" : "s"} available near you.
        </p>

        {providers.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted-foreground">
            No providers registered for this service yet. Check back soon.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {providers.map((p) => (
              <div key={p.id} className="flex flex-col rounded-2xl border border-border bg-surface-elevated p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                  <div className="flex shrink-0 items-center gap-1 rounded-md bg-cyan-accent/10 px-2 py-1 text-sm font-semibold text-cyan-accent">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {p.rating}
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Starting at <span className="font-semibold text-foreground">${p.hourly}/hr</span>
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate({ to: "/providers/$providerId/book", params: { providerId: p.id }, search: { serviceId, name: p.name, price: p.hourly, rating: p.rating } })}
                    className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow shadow-primary/20 hover:brightness-110"
                  >
                    Book Now
                  </button>
                  <Link
                    to="/providers/$providerId/book"
                    params={{ providerId: p.id }} search={{ serviceId, name: p.name, price: p.hourly, rating: p.rating }}
                    className="rounded-lg border border-border py-2.5 text-center text-sm font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

