import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Star, ChevronRight, Calendar, Clock, DollarSign, CheckCircle2, Loader2, ShieldAlert, User } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import { useState, useEffect, useMemo } from "react";
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

  // Profile Expansion / Calendar state
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Restore state identifier
  const [restoredSlotId, setRestoredSlotId] = useState<number | null>(null);
  const [expandedProviderReviews, setExpandedProviderReviews] = useState<any[]>([]);

  // Generate next 7 days for the visual calendar
  const dateTabs = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const selectedDateString = useMemo(() => {
    return selectedDate.toISOString().split("T")[0];
  }, [selectedDate]);

  // Initial fetch for service and providers
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

  // Load slots and details when expanded provider or selected date changes
  useEffect(() => {
    if (!expandedProviderId) return;

    const fetchSlotsAndDetails = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        
        const [slotsRes, detailsRes] = await Promise.all([
          api.get(`/Slots/${expandedProviderId}?date=${selectedDateString}`),
          api.get(`/Providers/${expandedProviderId}`)
        ]);

        if (slotsRes.data.success) {
          const fetchedSlots = slotsRes.data.data;
          setSlots(fetchedSlots);

          // If we had a restored slot, automatically pre-select it
          if (restoredSlotId) {
            const match = fetchedSlots.find((s: any) => s.id === restoredSlotId);
            if (match) {
              setSelectedSlot(match);
            }
            setRestoredSlotId(null); // Clear after application
          }
        }

        if (detailsRes.data.success) {
          setExpandedProviderReviews(detailsRes.data.data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to fetch slots or provider details", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlotsAndDetails();
  }, [expandedProviderId, selectedDateString, restoredSlotId]);

  // Attempt to restore saved booking state on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("savedBookingState");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.serviceId.toString() === serviceId) {
          setExpandedProviderId(state.providerId);
          setNotes(state.notes || "");
          if (state.selectedDateString) {
            setSelectedDate(new Date(state.selectedDateString));
          }
          if (state.selectedSlot) {
            setRestoredSlotId(state.selectedSlot.id);
          }
        }
      } catch (err) {
        console.warn("Could not restore saved booking state:", err);
      }
    }
  }, [serviceId]);

  // Helper calculations for checkout summary
  const price = selectedSlot ? Number(providers.find(p => p.id === expandedProviderId)?.hourly) || 0 : 0;
  const platformFee = Math.round(price * 0.1);
  const total = price + platformFee;

  const handleExpandProfile = (providerId: string, action: "view" | "book") => {
    if (expandedProviderId === providerId && action === "view") {
      setExpandedProviderId(null);
    } else {
      setExpandedProviderId(providerId);
      // Wait minor tick and scroll details into view
      setTimeout(() => {
        document.getElementById(`details-${providerId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const handleFinalizeBooking = async (provider: any) => {
    if (!selectedSlot) {
      alert("Please select an available booking slot.");
      return;
    }

    const isLoggedIn = !!localStorage.getItem("accessToken");
    if (!isLoggedIn) {
      // Secure redirect: save details to session storage
      const savedState = {
        serviceId,
        providerId: provider.id,
        providerName: provider.name,
        rating: provider.rating,
        price: provider.hourly,
        selectedSlot,
        notes,
        selectedDateString,
      };
      sessionStorage.setItem("savedBookingState", JSON.stringify(savedState));
      alert("Please log in to finalize your booking. We have saved your progress and will return you here immediately.");
      navigate({ to: "/login" });
      return;
    }

    // Call backend API
    try {
      setBookingInProgress(true);
      const payload = {
        providerId: Number(provider.id),
        serviceId: Number(serviceId),
        slotId: selectedSlot.id,
        notes: notes || "Booking finalized via web flow",
      };
      const res = await api.post("/Booking", payload);
      if (res.data.success) {
        setBookingSuccess(true);
        sessionStorage.removeItem("savedBookingState"); // Success, clear progress
        setTimeout(() => {
          navigate({ to: "/" });
        }, 2000);
      } else {
        alert(res.data.message || "Failed to finalize booking.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.details || "Failed to finalize booking. Please try again.");
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <TopNav />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-10">
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
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
            Available Specialists for <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">{service?.name || "Service"}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Compare rates, client ratings, and reserve specialized professionals instantly. Select a profile below to browse schedule availability.
          </p>
        </div>

        {/* Booking success overlay banner */}
        {bookingSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-350 text-sm font-semibold flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>Booking confirmed successfully! Redirecting you home...</span>
          </div>
        )}

        {providers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
            <User className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No registered providers</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-450">
              There are currently no specialists registered for this service in your area.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {providers.map((p) => {
              const isExpanded = expandedProviderId === p.id;

              return (
                <div
                  key={p.id}
                  id={`card-${p.id}`}
                  className={`rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-300 shadow-sm overflow-hidden ${
                    isExpanded
                      ? "border-violet-500 ring-1 ring-violet-500/35"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-705 hover:shadow-md"
                  }`}
                >
                  {/* Summary Profile Header */}
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-lg font-bold text-slate-800 dark:text-slate-200 shadow-inner">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          {p.name}
                          <span className="inline-flex items-center gap-1 rounded bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                            {p.experience} yrs exp
                          </span>
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                          <div className="flex items-center text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="ml-1 font-bold">{p.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-slate-350 dark:text-slate-600">•</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Starting at ${p.hourly}/hr</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                      <button
                        onClick={() => handleExpandProfile(p.id, "view")}
                        className={`flex-1 md:flex-none text-center px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
                          isExpanded
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                            : "bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        {isExpanded ? "Close Panel" : "View Profile"}
                      </button>
                      <button
                        onClick={() => handleExpandProfile(p.id, "book")}
                        className="flex-1 md:flex-none text-center px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Area */}
                  {isExpanded && (
                    <div
                      id={`details-${p.id}`}
                      className="border-t border-slate-200 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/50 p-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6"
                    >
                      {/* Left: Bio & Booking Slots Calendar */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Professional Summary</h4>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-350">{p.bio}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Client Reviews</h4>
                          {expandedProviderReviews.length === 0 ? (
                            <p className="text-xs italic text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                              No client reviews submitted for this provider yet.
                            </p>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                              {expandedProviderReviews.map((rev: any) => (
                                <div key={rev.id} className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-3.5 space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{rev.reviewerName}</span>
                                    <div className="flex items-center text-amber-500 gap-1">
                                      <Star className="h-3 w-3 fill-current" />
                                      <span className="font-bold">{rev.rating.toFixed(1)}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs italic text-slate-600 dark:text-slate-400 leading-relaxed">
                                    "{rev.comment || "Great service."}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                            Select Date & Time
                          </h4>
                          
                          {/* Visual Calendar Date Tabs */}
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {dateTabs.map((date) => {
                              const isSelected = date.getDate() === selectedDate.getDate();
                              const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                              const dayNum = date.getDate();
                              const monthName = date.toLocaleDateString("en-US", { month: "short" });

                              return (
                                <button
                                  key={date.toISOString()}
                                  onClick={() => setSelectedDate(date)}
                                  className={`flex flex-col items-center p-2.5 min-w-[70px] rounded-xl border text-center transition-all ${
                                    isSelected
                                      ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-550/20"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                  }`}
                                >
                                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{dayName}</span>
                                  <span className="text-lg font-black mt-0.5">{dayNum}</span>
                                  <span className="text-[9px] font-medium tracking-tight opacity-75">{monthName}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Time Slots Grid */}
                          <div className="mt-4">
                            {loadingSlots ? (
                              <div className="flex items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <Loader2 className="h-5 w-5 animate-spin text-violet-600 dark:text-violet-400" />
                              </div>
                            ) : slots.length === 0 ? (
                              <div className="p-6 text-center text-xs font-medium text-slate-450 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 border-dashed rounded-xl">
                                No booking slots available for {selectedDate.toLocaleDateString("en-US", { dateStyle: "long" })}.
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {slots.map((s) => {
                                  const isSlotSelected = selectedSlot?.id === s.id;
                                  return (
                                    <button
                                      key={s.id}
                                      onClick={() => setSelectedSlot(s)}
                                      disabled={s.isBooked}
                                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                                        s.isBooked
                                          ? "bg-slate-100 dark:bg-slate-850/50 border-slate-200/50 dark:border-slate-800 text-slate-350 dark:text-slate-600 cursor-not-allowed line-through"
                                          : isSlotSelected
                                            ? "bg-violet-100 dark:bg-violet-900/40 border-violet-500 text-violet-755 dark:text-violet-300 shadow-inner"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                                      }`}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        <Clock className="h-3 w-3 opacity-60" />
                                        <span>{s.startTime}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Booking Notes */}
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                            Add Booking Notes
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add details, specific requests, or entry instructions for the provider..."
                            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-550/40 resize-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                          />
                        </div>
                      </div>

                      {/* Right: Checkout Summary Sidebar */}
                      <div>
                        <aside className="h-fit rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">
                            Booking Summary
                          </h4>

                          {selectedSlot ? (
                            <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-350">
                              <div className="flex justify-between items-center">
                                <span>Appointment Date</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {selectedDate.toLocaleDateString("en-US", { dateStyle: "medium" })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Time Slot</span>
                                <span className="font-bold text-slate-850 dark:text-slate-150">{selectedSlot.startTime}</span>
                              </div>
                              <div className="my-2 h-px bg-slate-100 dark:bg-slate-850" />
                              <div className="flex justify-between items-center">
                                <span>Service Rate ({service?.name})</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">${p.hourly}.00</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Trust & Platform Fee (10%)</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">${platformFee}.00</span>
                              </div>
                              <div className="my-2 h-px bg-slate-100 dark:bg-slate-850" />
                              <div className="flex justify-between items-center text-sm font-extrabold text-slate-800 dark:text-white">
                                <span>Estimated Total</span>
                                <span className="text-violet-600 dark:text-violet-400 text-lg font-black">${total}.00</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 text-center rounded-lg bg-slate-50 dark:bg-slate-850/40 text-xs font-medium text-slate-400 dark:text-slate-500 border border-slate-250/20 dark:border-slate-800">
                              Select a date and time slot to view your checkout summary.
                            </div>
                          )}

                          <button
                            onClick={() => handleFinalizeBooking(p)}
                            disabled={!selectedSlot || bookingInProgress || bookingSuccess}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 text-white rounded-lg py-3 text-xs font-bold shadow hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                          >
                            {bookingInProgress ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Finalizing...</span>
                              </>
                            ) : (
                              <span>Finalize Booking</span>
                            )}
                          </button>
                        </aside>
                      </div>
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
