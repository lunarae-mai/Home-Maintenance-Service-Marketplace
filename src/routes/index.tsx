import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/top-nav";
import {
  ArrowRight,
  Droplets,
  Zap,
  Sparkles,
  Paintbrush,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [topProviders, setTopProviders] = useState<any[]>([]);
  const [stats, setStats] = useState<{ activeProviders: string; satisfactionRate: string }>({
    activeProviders: "—",
    satisfactionRate: "—",
  });

  useEffect(() => {
    const fetchTopProviders = async () => {
      try {
        const res = await api.get("/Providers/search?pageSize=12");
        if (res.data.success && res.data.data?.items) {
          const ranked = [...res.data.data.items]
            .filter((p: any) => Number(p.avgRating || 0) > 0)
            .sort((a: any, b: any) => Number(b.avgRating || 0) - Number(a.avgRating || 0));
          setTopProviders(ranked.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch top providers", err);
      }
    };
    const fetchStats = async () => {
      try {
        const res = await api.get("/Providers/stats");
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          setStats({
            activeProviders: d.activeProvidersCount != null ? `${d.activeProvidersCount}+` : "—",
            satisfactionRate:
              d.averageSatisfactionRate != null ? `${d.averageSatisfactionRate}%` : "—",
          });
        }
      } catch (err) {
        console.error("Failed to fetch platform stats", err);
      }
    };
    fetchTopProviders();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <TopNav />
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background"></div>
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-500 mb-8">
            <ShieldCheck className="h-3.5 w-3.5" />
            VERIFIED PROFESSIONALS · INSTANT BOOKING
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Home Maintenance{" "}
            <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              Marketplace
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            Experience elite maintenance delivered with precision. From intricate electrical work to
            premium interior painting, connect with high-fidelity providers through our
            obsidian-grade ecosystem.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-3.5 font-semibold text-white transition hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(109,40,217,0.3)]"
            >
              Explore Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth"
              search={{ role: "provider" }}
              className="w-full sm:w-auto rounded-full border border-border bg-white dark:bg-slate-900 px-8 py-3.5 font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-violet-500/40"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
            Our Services
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Everything your home needs
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a service category to explore available professionals
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard
            title="Plumbing"
            description="Precision hydraulic systems and repair services."
            icon={Droplets}
            image="/plumbing_neon_1783625090035.png"
          />
          <ServiceCard
            title="Electrical"
            description="High-voltage installations and smart home integration."
            icon={Zap}
            image="/electrical_neon_1783625098474.png"
          />
          <ServiceCard
            title="Cleaning"
            description="Concierge-level sanitization."
            icon={Sparkles}
            image="/cleaning_neon_1783625115972.png"
          />
          <ServiceCard
            title="Painting"
            description="Premium architectural coatings for elite estates."
            icon={Paintbrush}
            image="/painting_neon_1783625123454.png"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join thousands of homeowners who trust our vetted network of specialists.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-3.5 font-semibold text-white transition hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(109,40,217,0.3)]"
              >
                Browse All Services{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/auth"
                search={{ role: "provider" }}
                className="inline-flex items-center justify-center rounded-full border border-border bg-white dark:bg-slate-900 px-8 py-3.5 font-semibold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Join as Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold tracking-wide text-cyan-500">
            <ShieldCheck className="h-4 w-4" />
            VERIFIED EXCELLENCE
          </div>
          <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
            Top-Tier Providers for your Domain.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Real specialists ranked by customer satisfaction
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            {topProviders.length === 0 ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground p-6 rounded-2xl border border-border bg-surface">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                Loading top providers...
              </div>
            ) : (
              topProviders.map((p: any) => (
                <ProviderCard
                  key={p.providerId || p.id}
                  initial={(p.providerName || p.name || "P").charAt(0).toUpperCase()}
                  name={p.providerName || p.name || "Professional Specialist"}
                  rating={p.avgRating || 5.0}
                  bookings={p.totalBookings ? p.totalBookings.toString() : "0"}
                  desc={
                    p.bio ||
                    "Certified specialist with proven expertise and outstanding customer reviews."
                  }
                  providerId={String(p.providerId || p.id)}
                />
              ))
            )}
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border">
            <img
              src="/electrical_sparks_1783625080777.png"
              alt="Electrical Sparks"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-border bg-black/60 p-4 backdrop-blur-md">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-sm text-slate-300">Satisfaction Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-black text-foreground">{stats.activeProviders}</p>
            <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-violet-500" /> Active Providers
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-foreground">{stats.satisfactionRate}</p>
            <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Satisfaction Rate
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-foreground">15 min</p>
            <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-500" /> Avg. Response Time
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-foreground">100%</p>
            <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Vetted Specialists
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-24">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                Home Services
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
                The most advanced marketplace for elite home maintenance. Precision, security, and
                excellence delivered to your door.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Services</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Plumbing and HVAC
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Electrical Systems
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Sanitation and Care
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Architectural Finishes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Legal and Providers</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/auth" className="hover:text-primary transition">
                    Provider Portal
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-primary transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-primary transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between border-t border-border pt-8 text-xs text-muted-foreground">
            <p>2026 Home Services Marketplace. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex gap-6">
              <Link to="/" className="hover:text-foreground">
                Security
              </Link>
              <Link to="/" className="hover:text-foreground">
                Global Network
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ title, description, icon: Icon, image }: any) {
  return (
    <Link
      to="/services"
      search={{ category: title }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-surface block transition-all duration-300 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-black">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 p-8 w-full pointer-events-none">
        <div className="mb-4 inline-flex rounded-xl border border-white/20 bg-black/50 p-2.5 backdrop-blur-md text-cyan-400">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-violet-300 group-hover:text-white transition-colors">
          View Providers{" "}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function ProviderCard({ initial, name, rating, bookings, desc, providerId }: any) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 transition hover:border-violet-500/50 hover:bg-surface-elevated">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-lg font-bold text-white shadow-md shadow-violet-500/20 uppercase">
            {initial}
          </div>
          <div>
            <h4 className="font-bold text-foreground">{name}</h4>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="font-medium text-foreground">{Number(rating).toFixed(1)}</span>
              <span>({bookings} bookings)</span>
            </div>
          </div>
        </div>
        {providerId ? (
          <Link
            to="/providers/$providerId/book"
            params={{ providerId }}
            search={{ serviceId: "", price: "" }}
            className="text-sm font-semibold text-violet-600 dark:text-violet-400 transition hover:text-violet-500 dark:hover:text-violet-300"
          >
            Book Now
          </Link>
        ) : (
          <Link
            to="/services"
            className="text-sm font-semibold text-violet-600 dark:text-violet-400 transition hover:text-violet-500 dark:hover:text-violet-300"
          >
            Book Now
          </Link>
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{desc}</p>
    </div>
  );
}
