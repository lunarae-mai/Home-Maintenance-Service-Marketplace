import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/top-nav";
import { ArrowRight, Droplets, Zap, Sparkles, Paintbrush, ShieldCheck, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <TopNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background"></div>
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Home Maintanices{" "}
            <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              market Place
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
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 font-semibold text-white transition hover:from-purple-400 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              Explore Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth"
              className="w-full sm:w-auto rounded-full border border-border bg-surface px-6 py-3 font-semibold text-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard
            title="Plumbing"
            categoryId="1"
            description="Precision hydraulic systems and repair services."
            icon={Droplets}
            image="/plumbing_neon_1783625090035.png"
          />
          <ServiceCard
            title="Electrical"
            categoryId="2"
            description="High-voltage installations and smart home integration."
            icon={Zap}
            image="/electrical_neon_1783625098474.png"
          />
          <ServiceCard
            title="Cleaning"
            categoryId="3"
            description="Concierge-level sanitization."
            icon={Sparkles}
            image="/cleaning_neon_1783625115972.png"
          />
          <ServiceCard
            title="Painting & Finishing"
            categoryId="4"
            description="Premium architectural coatings and meticulous surface preparation for elite estates."
            icon={Paintbrush}
            image="/painting_neon_1783625123454.png"
          />
        </div>
      </section>

      {/* Top Tier Providers Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold tracking-wide text-cyan-500">
            <ShieldCheck className="h-4 w-4" />
            VERIFIED EXCELLENCE
          </div>
          <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
            Top-Tier Providers for your Domain.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <ProviderCard
              initial="E"
              name="Elite Maintenance Co."
              rating={4.9}
              bookings="2.4k"
              desc="Specializing in high-voltage industrial systems and residential smart grids. 15 years certified expertise."
            />
            <ProviderCard
              initial="A"
              name="Apex Paint & Polish"
              rating={5}
              bookings="840"
              desc="Master artisans in Venetian plaster and high-gloss architectural finishes. Precision guaranteed."
            />
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

      {/* Footer */}
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
                The world's most advanced marketplace for elite home maintenance. Precision,
                security, and excellence delivered directly to your door.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Services</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Plumbing & HVAC
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Electrical Systems
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Sanitation & Care
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Architectural Finishes
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary transition">
                    Smart Home Integration
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Legal & Providers</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/auth" className="hover:text-primary transition">
                    Provider Portal
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-primary transition">
                    Certification Standards
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
                <li>
                  <Link to="/" className="hover:text-primary transition">
                    Liability Protection
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between border-t border-border pt-8 text-xs text-muted-foreground">
            <p>© 2026 Home Services Marketplace. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex gap-6">
              <Link to="/" className="hover:text-foreground">
                Security
              </Link>
              <Link to="/" className="hover:text-foreground">
                Global Network
              </Link>
              <Link to="/" className="hover:text-foreground">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ title, description, icon: Icon, image, categoryId }: any) {
  return (
    <Link
      to="/services"
      search={{ category: title }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-surface block"
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
      </div>
    </Link>
  );
}

function ProviderCard({ initial, name, rating, bookings, desc }: any) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 transition hover:border-primary/50 hover:bg-surface-elevated">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-lg font-bold text-foreground">
            {initial}
          </div>
          <div>
            <h4 className="font-bold text-foreground">{name}</h4>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-cyan-500 text-cyan-500" />
              <span className="font-medium text-foreground">{rating}</span>
              <span>({bookings} Bookings)</span>
            </div>
          </div>
        </div>
        <Link
          to="/services"
          className="text-sm font-semibold text-cyan-500 transition hover:text-cyan-400"
        >
          Book Now
        </Link>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
