import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Star,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Loader2,
  Sparkles,
  User,
  Calendar,
} from "lucide-react";
import { TopNav } from "@/components/top-nav";
import api from "@/lib/api";

export const Route = createFileRoute("/providers/$providerId/book")({
  component: ProviderBookingPage,
  head: () => ({ meta: [{ title: "Book Professional — Home Services" }] }),
});

export function ProviderBookingPage() {
  const { providerId } = Route.useParams();
  const search = Route.useSearch() as any;
  const navigate = useNavigate();

  // Slot and Input States
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notesInput, setNotesInput] = useState("");

  // Provider details & services
  const [providerDetails, setProviderDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await api.get(`/Slots/${providerId}`);
        if (res.data.success) {
          const fetchedSlots = res.data.data;
          setSlots(fetchedSlots);
          // Auto-select the first date that has slots
          if (fetchedSlots.length > 0) {
            const firstDate = new Date(fetchedSlots[0].date);
            setSelectedDate(firstDate);
          }
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
      }
    };
    fetchSlots();
  }, [providerId]);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const res = await api.get(`/Providers/${providerId}`);
        if (res.data.success) {
          const data = res.data.data;
          setProviderDetails(data);

          const servicesList = data.services || [];
          const matched = servicesList.find((s: any) => String(s.id) === String(search.serviceId));
          const fallbackService = matched || servicesList[0] || null;
          setSelectedService(fallbackService);
        }
      } catch (err) {
        console.error("Failed to fetch provider details", err);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchProviderDetails();
  }, [providerId, search.serviceId]);

  const resolvedPrice = Number(search.price ?? (selectedService ? selectedService.price : 0));
  const price =
    Number.isFinite(resolvedPrice) && resolvedPrice > 0
      ? resolvedPrice
      : selectedService
        ? Number(selectedService.price)
        : 0;
  const platformFee = Math.round(price * 0.1); // 10% commission per API docs
  const total = price + platformFee;

  const handleCreateBooking = async () => {
    if (!selectedService) {
      alert("Please select a service.");
      return;
    }
    if (!selectedSlot) {
      alert("Please select a time slot.");
      return;
    }
    if (!deliveryAddress.trim()) {
      alert("Please enter the service delivery address.");
      return;
    }
    if (!contactPhone.trim()) {
      alert("Please enter a contact phone number.");
      return;
    }
    setSubmittingBooking(true);
    try {
      const payload = {
        providerId: Number(providerId),
        serviceId: Number(selectedService.id),
        slotId: Number(selectedSlot.id),
        notes: notesInput || "Booking created via web",
        serviceDeliveryAddress: deliveryAddress,
        contactPhoneNumber: contactPhone,
      };
      const res = await api.post("/Booking/finalize", payload);
      if (res.data?.success) {
        alert("Booking confirmed successfully!");
        navigate({ to: "/customer/profile" });
      } else {
        throw new Error(res.data?.message || "Failed to create booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create booking.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopNav />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
        </div>
      </div>
    );
  }

  const name = providerDetails?.name || "Professional Specialist";
  const avgRating = providerDetails?.avgRating || 0;
  const experience = providerDetails?.experience || 3;
  const bio =
    providerDetails?.bio || "Highly skilled certified technician dedicated to outstanding results.";
  const services = providerDetails?.services || [];
  const reviews = providerDetails?.reviews || [];

  // Build unique date tabs from actual slot dates (sorted ascending)
  const dateTabs: Date[] = Array.from(
    new Map(
      slots.map((s: any) => {
        const dateStr = new Date(s.date).toISOString().split("T")[0];
        return [dateStr, new Date(s.date)];
      }),
    ).values(),
  ).sort((a, b) => a.getTime() - b.getTime());

  const selectedDateString = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
  const filteredSlots = slots.filter((s: any) => {
    const slotDateString = new Date(s.date).toISOString().split("T")[0];
    return slotDateString === selectedDateString;
  });

  // Count slots per date for indicators
  const slotCountByDate: Record<string, number> = {};
  slots.forEach((s: any) => {
    const d = new Date(s.date).toISOString().split("T")[0];
    slotCountByDate[d] = (slotCountByDate[d] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <TopNav />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header & Identity Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-cyan-500" />

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 uppercase">
              {name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                  {name}
                </h1>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" /> Certified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {experience} years experience &bull; {providerDetails?.email}
              </p>

              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= Math.round(avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-450 dark:text-slate-500">
                  ({reviews.length} completed reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              Selected Service Rate
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              ${price}
              <span className="text-xs text-slate-400 font-normal"> / hour</span>
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Section Inputs */}
          <div className="space-y-6">
            {/* Interactive Booking Service Selector Grid */}
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-violet-500" /> Select Desired Service
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">
                  Choose one of the specialized services offered by this professional
                </p>
              </div>

              {services.length > 0 ? (
                <div className="mt-3">
                  <select
                    value={selectedService?.id || ""}
                    onChange={(e) => {
                      const matched = services.find((s: any) => String(s.id) === e.target.value);
                      setSelectedService(matched || null);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/55 transition text-xs font-bold text-slate-850 dark:text-white"
                  >
                    <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500">
                      -- Choose a Service --
                    </option>
                    {services.map((srv: any) => (
                      <option
                        key={srv.id}
                        value={srv.id}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                      >
                        {srv.name} (${srv.price} / hr)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-slate-450 dark:text-slate-500 italic">
                  No services registered for this provider.
                </p>
              )}
            </section>

            {/* Available slots */}
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-violet-500" /> PROVIDER AVAILABILITY SLOTS
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">
                  Choose a convenient date and slot to schedule the task execution
                </p>
              </div>

              {/* Horizontal Date Picker — driven by actual slot dates */}
              {dateTabs.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  This provider has not published any availability slots yet.
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {dateTabs.map((date) => {
                    const dateKey = date.toISOString().split("T")[0];
                    const isSelected = selectedDate
                      ? date.toISOString().split("T")[0] === selectedDateString
                      : false;
                    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                    const dayNum = date.getDate();
                    const monthName = date.toLocaleDateString("en-US", { month: "short" });
                    const slotCount = slotCountByDate[dateKey] || 0;

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        className={`relative flex flex-col items-center p-2.5 min-w-[70px] rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-violet-600 to-cyan-500 border-transparent text-white shadow-md shadow-violet-550/20"
                            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:border-violet-500/40 dark:hover:border-violet-500/40"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {dayName}
                        </span>
                        <span className="text-lg font-black mt-0.5">{dayNum}</span>
                        <span className="text-[9px] font-medium tracking-tight opacity-75">
                          {monthName}
                        </span>
                        {/* Slot count indicator dot */}
                        <span
                          className={`mt-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none ${
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-violet-500/10 text-violet-650 dark:text-violet-400"
                          }`}
                        >
                          {slotCount} slot{slotCount !== 1 ? "s" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Time Slots Grid — filtered to selected date */}
              {dateTabs.length > 0 && (
                <div className="mt-2">
                  {filteredSlots.length === 0 ? (
                    <div className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <Calendar className="h-6 w-6 mx-auto opacity-30 mb-2" />
                      <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No slots available for{" "}
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Select another date from the calendar above
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {filteredSlots.map((s) => {
                        const isSlotSelected = selectedSlot?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSlot(s)}
                            className={`rounded-xl p-3 text-center transition cursor-pointer border flex flex-col justify-center items-center gap-1 ${
                              isSlotSelected
                                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-transparent shadow-md shadow-violet-500/15"
                                : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-405 hover:border-violet-500/40 dark:hover:border-violet-500/40"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5 opacity-60 mb-0.5" />
                            <span className="text-xs font-extrabold leading-none">
                              {s.startTime.substring(0, 5)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Delivery Inputs */}
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-violet-500" /> Booking Details
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">
                  Input the delivery coordinates and additional provider notes
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                    Service Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="123 Main St, Apartment 4B"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 555-123-4567"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                  Customer Notes / Guidelines (Optional)
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition resize-none"
                  placeholder="Share details, access codes, parking info..."
                />
              </div>
            </section>

            {/* Provider Reviews Section */}
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-violet-500" /> Vetted Experience Reviews
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">
                  Real historical data and comments left by previous customers
                </p>
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {reviews.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">
                            {rev.reviewerName}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black text-slate-700 dark:text-slate-350">
                            {rev.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-450 dark:text-slate-500 italic">
                  No feedback reviews compiled for this provider yet.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar Booking Summary Block */}
          <aside className="h-fit rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sticky top-24 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Booking Summary
            </h3>

            {selectedService ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  {selectedService.name}
                </p>
                <p className="text-[10px] text-slate-500">{name}</p>
              </div>
            ) : null}

            {selectedSlot ? (
              <div className="space-y-1 bg-violet-500/5 p-3 rounded-2xl border border-violet-500/10 text-xs">
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-violet-500" />
                  {new Date(selectedSlot.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-violet-500" />
                  {selectedSlot.startTime.substring(0, 5)}
                </p>
              </div>
            ) : null}

            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Service rate</span>
                <span>${price}.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Platform maintenance fee</span>
                <span>${platformFee}.00</span>
              </div>
              <div className="my-2 h-px bg-slate-100 dark:bg-slate-800/80" />
              <div className="flex items-center justify-between font-black text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-base text-violet-600 dark:text-cyan-400">${total}.00</span>
              </div>
            </div>

            <button
              onClick={handleCreateBooking}
              className="mt-5 w-full flex items-center justify-center bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl py-3 text-xs font-bold transition shadow-lg shadow-violet-500/25 disabled:opacity-50 hover:scale-[1.01] active:scale-95 cursor-pointer"
              disabled={!selectedSlot || submittingBooking}
            >
              {submittingBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Finalize Booking
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
