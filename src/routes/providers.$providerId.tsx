import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  Star,
  ChevronRight,
  User,
  Mail,
  Phone,
  Award,
  ShieldCheck,
  Heart,
  ArrowRight,
} from "lucide-react";
import { TopNav } from "@/components/top-nav";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ProviderBookingPage } from "./providers.$providerId.book";

export const Route = createFileRoute("/providers/$providerId")({
  component: PublicProviderProfile,
  head: () => ({ meta: [{ title: "Provider Profile — Home Services" }] }),
});

function PublicProviderProfile() {
  const { providerId } = Route.useParams();
  const pathname = useRouterState({
    select: (state: any) => (state.location.pathname as string) || "",
  });
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedService(null), 200);
  };

  const isBookingRoute = pathname.endsWith("/book") || pathname.endsWith("/book/");

  useEffect(() => {
    if (isBookingRoute) {
      return;
    }

    const fetchProvider = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/Providers/${providerId}`);
        if (res.data.success) {
          setProvider(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load provider details.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [providerId, isBookingRoute]);

  if (isBookingRoute) {
    return <ProviderBookingPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopNav />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-650 dark:border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopNav />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <User className="h-16 w-16 text-slate-350 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-bold">Provider not found</h2>
          <p className="text-sm text-slate-550 dark:text-slate-450 mt-1.5 mb-6">
            The profile you are trying to view does not exist or has been disabled.
          </p>
          <Link
            to="/services"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-6">
          <Link
            to="/services"
            className="hover:text-violet-650 dark:hover:text-violet-400 transition"
          >
            Services
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700 dark:text-slate-300">{provider.name}'s Profile</span>
        </nav>

        {/* Profile Card Header */}
        <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-cyan-500" />

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-black text-3xl shadow-lg shadow-violet-500/20 uppercase">
              {provider.name?.charAt(0) || "P"}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {provider.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-0.5 text-xs font-extrabold text-violet-700 dark:text-violet-300">
                    <Award className="h-3.5 w-3.5" /> {provider.experience || 0} Years Experience
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 px-3 py-0.5 text-xs font-extrabold text-cyan-700 dark:text-cyan-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> Vetted Specialist
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4.5 w-4.5 fill-current" />
                    <span className="ml-1.5 font-bold text-sm">
                      {(provider.avgRating || provider.rating || 5.0).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-slate-350 dark:text-slate-600 mx-2">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Professional Rating
                  </span>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-350 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Biography
                </h3>
                <p>{provider.bio || "No bio information provided yet."}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-violet-500 shrink-0" />
                  {provider.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-violet-500 shrink-0" />
                  {provider.phone || "No public phone listed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <Heart className="h-5 w-5 text-rose-500" /> Services Offered
              </h2>

              {!provider.services || provider.services.length === 0 ? (
                <p className="text-sm italic text-slate-550 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-center">
                  No services registered yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {provider.services.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between gap-4 hover:border-violet-500/30 transition-all duration-300"
                    >
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">
                          {s.name}
                        </h4>
                        <p className="text-xs font-black text-violet-655 dark:text-cyan-400 mt-0.5">
                          ${s.price} / hr
                        </p>
                        <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {s.details || "Standard service operation with quality guarantee."}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenModal(s)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:border-violet-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-violet-600 dark:hover:text-violet-400 transition-all shadow-sm cursor-pointer"
                      >
                        View Details <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historical Customer Reviews */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <Star className="h-5 w-5 text-amber-500" /> Vetted Customer Reviews
              </h2>

              {!provider.reviews || provider.reviews.length === 0 ? (
                <p className="text-sm italic text-slate-550 dark:text-slate-500 p-8 bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-center">
                  This provider has not received any reviews yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {provider.reviews.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:shadow-sm transition"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                          {rev.reviewerName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-500 gap-0.5">
                        {Array.from({ length: 5 }, (_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3.5 w-3.5 ${
                              idx < rev.rating
                                ? "fill-current"
                                : "text-slate-200 dark:text-slate-800"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs italic text-slate-600 dark:text-slate-450 leading-relaxed font-medium">
                        "{rev.comment || "Vetted service, no comment provided."}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick info panel */}
          <div>
            <aside className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sticky top-24 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-150 dark:border-slate-800/80 pb-2">
                Service Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                To learn more about a specific task, click the <strong>"View Details"</strong>{" "}
                action next to the desired service option on the left.
              </p>
              <div className="p-3 bg-violet-500/5 rounded-2xl border border-violet-550/15 text-xs text-slate-655 dark:text-slate-350">
                You will be presented with a detailed overview of the service scope, provider
                specifics, and pricing details.
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Dynamic Service Details Modal */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 transform transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-t-3xl" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Service Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Service Name
                </p>
                <p className="text-lg font-bold text-slate-850 dark:text-slate-200">
                  {selectedService.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Base Price
                </p>
                <div className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-sm font-black text-violet-700 dark:text-violet-300">
                  ${selectedService.price} / hr
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Description & Scope
                </p>
                <div className="rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                    {selectedService.details ||
                      "Standard service operation with quality guarantee. The provider handles all primary tasks associated with this category."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleCloseModal}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 font-bold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-cyan-400 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
