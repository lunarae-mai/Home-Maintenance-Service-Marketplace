import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { TopNav } from "@/components/top-nav";
import {
  Star,
  Mail,
  Phone,
  Briefcase,
  ChevronLeft,
  Loader2,
  DollarSign,
  Award,
  MessageSquare,
} from "lucide-react";

export const Route = createFileRoute("/admin/providers/$id")({
  component: ProviderDetail,
  head: () => ({ meta: [{ title: "Provider Profile Detail — Admin Console" }] }),
});

function getInitials(name: string) {
  if (!name) return "PR";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ProviderDetail() {
  const { id } = useParams({ from: "/admin/providers/$id" });
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/Admin/providers/${id}`);
        if (res.data.success) {
          setProvider(res.data.data);
        } else {
          setError("Failed to retrieve provider details.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Error connecting to provider database.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="text-sm font-semibold tracking-wider text-slate-400 animate-pulse">
            Loading Provider Profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-slate-200 p-6 text-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <p className="text-rose-400 font-bold mb-4">Error Loading Profile</p>
          <p className="text-sm text-slate-400 mb-6">{error || "Provider could not be found."}</p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-4 w-4" /> Return to Admin Console
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-purple-500/30 flex flex-col">
      <TopNav />
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Header Action */}
          <div className="mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition font-medium text-sm group"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Command Center
            </Link>
          </div>

          {/* Profile Card Banner */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
            <div className="h-40 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 relative">
              <div className="absolute -bottom-14 left-8 h-28 w-28 rounded-2xl border-4 border-[#09090b] bg-gradient-to-tr from-slate-700 to-slate-900 p-0.5 shadow-xl">
                <div className="h-full w-full rounded-xl bg-black flex items-center justify-center text-4xl font-black text-white">
                  {getInitials(provider.providerName)}
                </div>
              </div>
            </div>

            <div className="px-8 pt-20 pb-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{provider.providerName}</h1>
                  <p className="text-cyan-400 font-semibold mt-1 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    Professional Service Provider
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5">
                    <span className={`h-1.5 w-1.5 rounded-full ${provider.status === "Approved" ? "bg-emerald-400" : provider.status === "PendingApproval" ? "bg-amber-400" : provider.status === "Suspended" ? "bg-red-400" : "bg-rose-500"}`}></span>
                    {provider.status === "PendingApproval" ? "In Review" : provider.status}
                  </span>
                  <div className="flex items-center gap-1 text-slate-300 font-bold text-sm">
                    <span className="text-slate-400">Rating:</span>
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                    <span>{provider.avgRating ? provider.avgRating.toFixed(1) : "5.0"}</span>
                  </div>
                </div>
              </div>

              {/* Bio Details */}
              <div className="mb-8 rounded-2xl border border-white/5 bg-black/20 p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Professional Biography</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {provider.bio || "No professional biography has been provided yet."}
                </p>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="rounded-xl border border-white/5 bg-black/20 p-5 flex items-center gap-4">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</p>
                    <p className="text-slate-200 text-sm font-semibold truncate max-w-[200px]">{provider.email}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/20 p-5 flex items-center gap-4">
                  <Phone className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone Connection</p>
                    <p className="text-slate-200 text-sm font-semibold">{provider.phone || "+1 (555) 019-2834"}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/20 p-5 flex items-center gap-4">
                  <Award className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Experience</p>
                    <p className="text-slate-200 text-sm font-semibold">{provider.experience || 3} Years</p>
                  </div>
                </div>
              </div>

              {/* Offered Services */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-400" />
                  Offered Services & Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.offeredServices && provider.offeredServices.length > 0 ? (
                    provider.offeredServices.map((srv: any) => (
                      <div key={srv.serviceId} className="rounded-2xl border border-white/5 bg-black/20 p-5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-200">{srv.serviceName}</p>
                          <p className="text-xs text-slate-500 mt-1">Rates apply per service request</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-cyan-400 flex items-center justify-end">
                            <DollarSign className="h-4 w-4 shrink-0" />
                            {srv.basePrice}
                          </p>
                          <p className="text-[10px] uppercase text-slate-400 mt-0.5 tracking-wider">
                            {srv.priceType || "Fixed"} Rate
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 text-slate-550 italic text-sm">
                      No services configured.
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-cyan-400" />
                  Client Reviews & Ratings
                </h2>
                
                {provider.reviews && provider.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {provider.reviews.map((rev: any) => (
                      <div key={rev.id} className="rounded-2xl border border-white/5 bg-black/30 p-5">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div>
                            <p className="font-semibold text-slate-200">{rev.reviewerName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recently"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 text-xs text-amber-400 font-bold shrink-0">
                            <Star className="h-3.5 w-3.5 fill-amber-400 shrink-0" />
                            {rev.rating.toFixed(1)}
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed italic">
                          "{rev.comment || "Great quality of service provided."}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-slate-500 text-sm italic">
                    No client reviews submitted for this provider yet.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
