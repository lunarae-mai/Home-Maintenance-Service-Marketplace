import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sun, Moon, Palette, User, X, Lock, Mail, Phone, LogOut, ShieldAlert, CheckCircle2, Loader2, Star, Pencil, Trash2 } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useState, useEffect } from "react";
import api, { getApiData } from "@/lib/api";

const links = [
  { to: "/" as const, label: "Home" },
  { to: "/services" as const, label: "Services" },
  { to: "/admin/login" as const, label: "Admin" },
];

export function TopNav() {
  const { theme, toggle, palette, setPalette } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "password" | "bookings">("profile");

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");

  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Cancel / Edit Notes state
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  // Review state
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSaving, setIsSaving] = useState(false);

  // ── FIXED: uses new JWT-based route, no longer trusts a URL param ──
  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(typeof window !== "undefined" && !!localStorage.getItem("accessToken"));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  const fetchCustomerBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await api.get(`/Booking/my-bookings`);
      if (res.data.success) {
        setActiveBookings(res.data.data.activeBookings || []);
        setPastBookings(res.data.data.pastBookings || []);
      }
    } catch (err) {
      console.error("Failed to load customer booking history", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (showProfileModal && activeSubTab === "bookings") {
      fetchCustomerBookings();
    }
  }, [activeSubTab, showProfileModal]);


  // Fetch Customer Profile on Modal Open
  useEffect(() => {
    if (!showProfileModal) return;
    setMessage({ type: "", text: "" });
    const fetchProfile = async () => {
      try {
        const res = await api.get("/User/me");
        const u = getApiData<any>(res);
        if (u) {
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setUserId(u.id || "");
        }
      } catch (err) {
        console.error("Failed to load customer profile", err);
      }
    };
    fetchProfile();
  }, [showProfileModal]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsSaving(true);
    try {
      const res = await api.put("/User/me", {
        name,
        email,
        phone,
      });
      if (res.data.success) {
        setMessage({ type: "success", text: "Profile details saved successfully!" });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.details || err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.post("/User/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.details || err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setShowProfileModal(false);
    window.location.href = "/";
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    setActionMessage({ type: "", text: "" });
    try {
      await api.put(`/Booking/${bookingId}/cancel`);
      setActionMessage({ type: "success", text: "Booking cancelled successfully." });
      fetchCustomerBookings();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to cancel booking." });
    } finally {
      setActionLoading(false);
      setCancellingId(null);
    }
  };

  const handleUpdateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setActionLoading(true);
    setActionMessage({ type: "", text: "" });
    try {
      await api.put(`/Booking/${editingBooking.id}/update-notes`, { notes: editNotes });
      setActionMessage({ type: "success", text: "Notes updated successfully." });
      setEditingBooking(null);
      fetchCustomerBookings();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to update notes." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingBooking) return;
    setReviewLoading(true);
    try {
      await api.post("/Review", { bookingId: reviewingBooking.id, rating: reviewRating, comment: reviewComment });
      setActionMessage({ type: "success", text: "Review submitted successfully!" });
      setReviewingBooking(null);
      setReviewComment("");
      setReviewRating(5);
      fetchCustomerBookings();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to submit review." });
    } finally {
      setReviewLoading(false);
    }
  };

  const cyclePalette = () => {
    if (palette === "purple") setPalette("cyan");
    else if (palette === "cyan") setPalette("green");
    else setPalette("purple");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <Home className="h-4 w-4" />
            </div>
            <span>Home Services</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={cyclePalette}
              aria-label="Cycle Palette"
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Palette
                className="h-4 w-4"
                style={{
                  color:
                    palette === "purple" ? "#8B5CF6" : palette === "cyan" ? "#06B6D4" : "#10B981",
                }}
              />
            </button>
            
            {isLoggedIn ? (
              <button
                onClick={() => setShowProfileModal(true)}
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-cyan-accent text-primary-foreground hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <User className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-cyan-accent text-primary-foreground hover:scale-105 transition"
              >
                <User className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* CUSTOMER PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-2xl p-6 md:p-8 space-y-6">
            
            {/* Gradient Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your personal settings and profile</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab selection */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 border border-slate-200/50 dark:border-slate-800/50">
              <button
                onClick={() => {
                  setActiveSubTab("profile");
                  setMessage({ type: "", text: "" });
                }}
                className={`rounded-lg py-2 text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeSubTab === "profile"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => {
                  setActiveSubTab("bookings");
                  setMessage({ type: "", text: "" });
                }}
                className={`rounded-lg py-2 text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeSubTab === "bookings"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => {
                  setActiveSubTab("password");
                  setMessage({ type: "", text: "" });
                }}
                className={`rounded-lg py-2 text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeSubTab === "password"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Security
              </button>
            </div>

            {/* Notification Alert */}
            {message.text && (
              <div className={`p-4 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Tab Contents */}
            {activeSubTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase block tracking-wider">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase block tracking-wider">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl bg-slate-200/50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 py-2.5 pl-10 pr-4 text-sm cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase block tracking-wider">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Profile Details"}
                </button>
              </form>
            )}

            {activeSubTab === "bookings" && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">

                {/* Action feedback message */}
                {actionMessage.text && (
                  <div className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 ${
                    actionMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300"
                  }`}>
                    {actionMessage.type === "success"
                      ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      : <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                    <span>{actionMessage.text}</span>
                  </div>
                )}

                {/* Edit Notes inline form */}
                {editingBooking && (
                  <form onSubmit={handleUpdateNotes} className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 space-y-3">
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">Edit Notes for Booking #{editingBooking.id}</p>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Update your notes for the provider..."
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs px-3 py-2 focus:outline-none focus:border-violet-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={actionLoading}
                        className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2 text-xs font-bold text-white disabled:opacity-50 transition hover:brightness-110 active:scale-95">
                        {actionLoading ? "Saving..." : "Save Notes"}
                      </button>
                      <button type="button" onClick={() => setEditingBooking(null)}
                        className="px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Review inline form */}
                {reviewingBooking && (
                  <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Review Booking #{reviewingBooking.id}</p>
                    {/* Star rating */}
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)}>
                          <Star className={`h-5 w-5 transition ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-xs text-slate-400 self-center">{reviewRating}/5</span>
                    </div>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this provider..."
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs px-3 py-2 focus:outline-none focus:border-cyan-500 resize-none"
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={reviewLoading}
                        className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2 text-xs font-bold text-white disabled:opacity-50 transition hover:brightness-110 active:scale-95">
                        {reviewLoading ? "Submitting..." : "Submit Review"}
                      </button>
                      <button type="button" onClick={() => setReviewingBooking(null)}
                        className="px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {isLoadingBookings ? (
                  <div className="py-12 flex justify-center items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading bookings...</span>
                  </div>
                ) : activeBookings.length === 0 && pastBookings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-400 dark:text-slate-650" />
                    <p className="text-sm font-semibold">No bookings found</p>
                    <p className="text-xs mt-1">Vetted specialists will show up here once booked.</p>
                  </div>
                ) : (
                  <>
                    {/* ── ACTIVE BOOKINGS ── */}
                    {activeBookings.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Active Requests</h4>
                        {activeBookings.map((b) => {
                          const isPending = b.status === "Pending" || b.status === 0;
                          return (
                            <div key={b.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-white">{b.service?.name || "Maintenance Service"}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-450 font-medium mt-0.5">
                                    Specialist: {b.provider?.user?.name || "Professional"}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                  isPending
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-350"
                                    : b.status === "Confirmed" || b.status === 1
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-350"
                                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-350"
                                }`}>
                                  {b.statusLabel || (b.status === 0 ? "Pending" : b.status === 1 ? "Confirmed" : "In Progress")}
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-500 dark:text-slate-450 font-medium">
                                Schedule: {b.slot ? `${new Date(b.slot.date).toLocaleDateString()} @ ${b.slot.startTime?.substring(0, 5)}` : "Not assigned"}
                              </div>
                              {b.notes && (
                                <p className="text-[10px] italic text-slate-400 bg-slate-100 dark:bg-slate-850 p-2 rounded-lg">
                                  Your Note: "{b.notes}"
                                </p>
                              )}
                              {b.providerNotes && (
                                <div className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 text-[10px] text-slate-700 dark:text-slate-350">
                                  <p className="font-bold text-violet-600 dark:text-violet-455 mb-0.5">Note from Provider:</p>
                                  <p className="italic">"{b.providerNotes}"</p>
                                </div>
                              )}

                              {/* Action buttons — only visible when Pending */}
                              {isPending && (
                                <div className="flex gap-2 pt-1">
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => { setEditingBooking(b); setEditNotes(b.notes || ""); setReviewingBooking(null); setActionMessage({ type: "", text: "" }); }}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-[10px] font-bold text-violet-400 hover:bg-violet-500/20 transition active:scale-95 disabled:opacity-40"
                                  >
                                    <Pencil className="h-3 w-3" /> Edit Notes
                                  </button>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-[10px] font-bold text-rose-400 hover:bg-rose-500/20 transition active:scale-95 disabled:opacity-40"
                                  >
                                    <Trash2 className="h-3 w-3" /> Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── PAST BOOKINGS ── */}
                    {pastBookings.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Past Bookings</h4>
                        {pastBookings.map((b) => {
                          const isCompleted = b.status === "Completed" || b.status === "Paid" || b.status === 3 || b.status === 4;
                          return (
                            <div key={b.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-80 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-white">{b.service?.name || "Maintenance Service"}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-450 font-medium mt-0.5">
                                    Specialist: {b.provider?.user?.name || "Professional"}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                  isCompleted
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355"
                                    : b.status === "Cancelled" || b.status === 5
                                    ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-350"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-350"
                                }`}>
                                  {b.statusLabel || (b.status === 3 || b.status === 4 ? "Completed" : b.status === 5 ? "Cancelled" : "Rejected")}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-455 font-medium">
                                Schedule: {b.slot ? `${new Date(b.slot.date).toLocaleDateString()} @ ${b.slot.startTime?.substring(0, 5)}` : "Not assigned"}
                              </div>
                              {b.providerNotes && (
                                <div className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 text-[10px] text-slate-700 dark:text-slate-350">
                                  <p className="font-bold text-violet-605 dark:text-violet-455 mb-0.5">Note from Provider:</p>
                                  <p className="italic">"{b.providerNotes}"</p>
                                </div>
                              )}
                              {/* Leave Review button for completed bookings */}
                              {isCompleted && (
                                <button
                                  onClick={() => { setReviewingBooking(b); setEditingBooking(null); setReviewRating(5); setReviewComment(""); setActionMessage({ type: "", text: "" }); }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition active:scale-95"
                                >
                                  <Star className="h-3 w-3" /> Leave a Review
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


            {activeSubTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase block tracking-wider">Current Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase block tracking-wider">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase block tracking-wider">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSaving ? "Changing..." : "Change Access Password"}
                </button>
              </form>
            )}

            {/* Bottom Footer & Sign Out */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out from Account
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                Close Settings
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
