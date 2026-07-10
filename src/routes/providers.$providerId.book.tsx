import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import api from "@/lib/api";
import { z } from "zod";

export const Route = createFileRoute("/providers/$providerId/book")({
  component: BookingPage,
  validateSearch: z.object({
    serviceId: z.string().or(z.number()).optional(),
    name: z.string().optional(),
    price: z.string().or(z.number()).optional(),
    rating: z.string().or(z.number()).optional(),
  }),
});

function BookingPage() {
  const { providerId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await api.get(`/Slots/${providerId}?date=${today}`);
        if (res.data.success) {
          setSlots(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
      }
    };
    fetchSlots();
  }, [providerId]);

  const price = Number(search.price) || 0;
  const platformFee = Math.round(price * 0.1); // 10% commission per API docs
  const total = price + platformFee;

  const handleCreateBooking = async () => {
    if (!selectedSlot) {
      alert("Please select a time slot.");
      return;
    }
    try {
      await api.post("/Booking", {
        providerId: Number(providerId),
        serviceId: Number(search.serviceId),
        slotId: selectedSlot.id,
        notes: "Booking created via web",
      });
      alert("Booking confirmed successfully!");
      navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      alert("Failed to create booking.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mt-1 text-3xl font-bold uppercase tracking-tight">
              {search.name || "Provider"}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-cyan-accent text-cyan-accent" />
              <span className="font-semibold text-foreground">{search.rating || 0}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Starting at</p>
            <p className="text-3xl font-bold text-primary">
              ${price}
              <span className="text-base text-muted-foreground"> / hr</span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold">Available Slots Today</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-3">
                    No slots available today.
                  </p>
                ) : (
                  slots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSlot(s)}
                      className={`rounded-md py-2 text-xs font-medium transition ${
                        selectedSlot?.id === s.id
                          ? "bg-cyan-accent text-background"
                          : "bg-background border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.startTime}
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-surface-elevated p-6 lg:sticky lg:top-24">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Booking Summary
            </h3>
            <div className="mt-6 space-y-1.5 border-t border-border pt-4 text-sm">
              <Row label="Service fee" value={`$${price}.00`} />
              <Row label="Platform maintenance fee" value={`$${platformFee}.00`} />
              <div className="my-2 h-px bg-border" />
              <Row label="Total" value={`$${total}.00`} bold />
            </div>

            <button
              onClick={handleCreateBooking}
              className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 disabled:opacity-50"
              disabled={!selectedSlot}
            >
              Finalize Booking
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between ${bold ? "font-bold" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
