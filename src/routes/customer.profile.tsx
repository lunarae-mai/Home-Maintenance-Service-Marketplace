import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  User, Lock, Calendar, Star, Pencil, Trash2, Home, X, Mail, Phone, Loader2, CheckCircle2, ShieldAlert, Clock, ChevronRight
} from "lucide-react";
import { TopNav } from "@/components/top-nav";
import api from "@/lib/api";

export const Route = createFileRoute("/customer/profile")({
  component: CustomerProfilePage,
  head: () => ({ meta: [{ title: "My Profile — Home Services" }] }),
});

function CustomerProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "password">("profile");

  // Authentication Check
  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "In Progress" | "Completed" | "Cancelled">("All");

  // Customer Reviews about me
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [customerRating, setCustomerRating] = useState(0);

  // Cancel / Edit Notes state
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  // Review state
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Payment Verification Submission state
  const [verifyingPaymentBooking, setVerifyingPaymentBooking] = useState<any | null>(null);
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentMethodInput, setPaymentMethodInput] = useState("Cash");
  const [submittingPaymentVerification, setSubmittingPaymentVerification] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/auth" });
    }
  }, [isLoggedIn]);

  // Fetch Customer Profile & Reviews
  const fetchProfileAndReviews = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get("/User/me");
      if (res.data.success) {
        const u = res.data.data;
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setUserId(u.id || "");

        // Fetch customer reviews left by providers
        const revRes = await api.get(`/Review/customer/${u.id}`);
        if (revRes.data.success) {
          setCustomerReviews(revRes.data.data.reviews || []);
          setCustomerRating(revRes.data.data.averageRating || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load customer profile or reviews", err);
    }
  };

  useEffect(() => {
    fetchProfileAndReviews();
  }, [isLoggedIn]);

  // Fetch customer bookings
  const fetchCustomerBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await api.get(`/Booking/my-bookings`);
      if (res.data.success) {
        const active = res.data.data.activeBookings || [];
        const past = res.data.data.pastBookings || [];
        setBookings([...active, ...past]);
      }
    } catch (err) {
      console.error("Failed to load customer booking history", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === "bookings") {
      fetchCustomerBookings();
    }
  }, [activeTab, isLoggedIn]);

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
        fetchProfileAndReviews();
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
      await api.post("/reviews", { bookingId: reviewingBooking.id, rating: reviewRating, comment: reviewComment });
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

  const handleSubmitPaymentVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingPaymentBooking) return;
    setSubmittingPaymentVerification(true);
    try {
      await api.post(`/Booking/${verifyingPaymentBooking.id}/submit-payment`, {
        amountPaid: Number(paidAmountInput),
        reference: paymentReference,
        paymentMethod: paymentMethodInput
      });
      setActionMessage({ type: "success", text: "Payment verification details submitted successfully!" });
      setVerifyingPaymentBooking(null);
      setPaymentReference("");
      setPaidAmountInput("");
      setPaymentMethodInput("Cash");
      fetchCustomerBookings();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to submit payment details." });
    } finally {
      setSubmittingPaymentVerification(false);
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter((b) => {
      if (filterStatus === "All") return true;
      const isPending = b.status === "Pending" || b.status === 0 || b.status === "0";
      const isConfirmed = b.status === "Confirmed" || b.status === 1 || b.status === "1";
      const isInProgress = b.status === "InProgress" || b.status === 2 || b.status === "2";
      const isCompleted = b.status === "Completed" || b.status === "Paid" || b.status === 3 || b.status === 4 || b.status === "3" || b.status === "4";
      const isCancelled = b.status === "Cancelled" || b.status === 5 || b.status === "5";
      const isRejected = b.status === "Rejected" || b.status === 6 || b.status === "6";

      if (filterStatus === "Pending") return isPending;
      if (filterStatus === "In Progress") return isConfirmed || isInProgress;
      if (filterStatus === "Completed") return isCompleted;
      if (filterStatus === "Cancelled") return isCancelled || isRejected;
      return true;
    });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <TopNav />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex flex-col items-center text-center p-6 space-y-3">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-extrabold text-2xl shadow-lg shadow-violet-500/20">
                  {name.charAt(0).toUpperCase() || "C"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{name || "Customer"}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{email}</p>
                </div>
              </div>
              
              <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1">
                <button
                  onClick={() => { setActiveTab("profile"); setMessage({ type: "", text: "" }); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <User className="h-4 w-4" /> Personal Information
                </button>
                <button
                  onClick={() => { setActiveTab("bookings"); setMessage({ type: "", text: "" }); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "bookings"
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Calendar className="h-4 w-4" /> My Bookings
                </button>
                <button
                  onClick={() => { setActiveTab("password"); setMessage({ type: "", text: "" }); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "password"
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Lock className="h-4 w-4" /> Security & Access
                </button>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <section className="flex-grow space-y-6">
            <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
              
              {/* Alert Message Banner */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
                  message.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                }`}>
                  {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
                  <span className="text-xs font-semibold">{message.text}</span>
                </div>
              )}

              {actionMessage.text && (
                <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
                  actionMessage.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                }`}>
                  {actionMessage.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
                  <span className="text-xs font-semibold">{actionMessage.text}</span>
                </div>
              )}

              {/* 1. PERSONAL INFORMATION TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">Review and update your contact details</p>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition placeholder-slate-400 dark:text-slate-100"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider block">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition placeholder-slate-400 dark:text-slate-100"
                          placeholder="+1 555-123-4567"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider block">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition placeholder-slate-400 dark:text-slate-100"
                        placeholder="jane.doe@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center justify-center bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-violet-500/25 hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </button>
                  </form>

                  {/* REVIEWS ABOUT ME SECTION */}
                  <div className="border-t border-slate-150 dark:border-slate-850 pt-8 mt-8 space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">My Service Experience (Reviews About Me)</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Feedback and rating summaries submitted by professionals who worked with you</p>
                    </div>

                    {customerReviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Overall Customer Score</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                              {customerRating.toFixed(1)}
                              <span className="text-xs text-slate-500 font-medium"> / 5.0</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">({customerReviews.length} jobs)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {customerReviews.map((rev) => (
                            <div key={rev.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-bold text-slate-800 dark:text-white">{rev.reviewerName || "Professional Specialist"}</p>
                                  <p className="text-[9px] text-slate-500 mt-0.5">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">{rev.rating}</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{rev.comment}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed text-slate-400 text-xs">
                        No service logs or provider feedback comments have been recorded for you yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. MY BOOKINGS HISTORY TAB */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Bookings History</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">Review all active and historical service requests</p>
                    </div>

                    {/* Filter Toolbar (Dark/Light mode adapted) */}
                    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 backdrop-blur-md p-1 border border-slate-200/50 dark:border-slate-800 w-fit">
                      {(["All", "Pending", "In Progress", "Completed", "Cancelled"] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition cursor-pointer ${
                            filterStatus === status
                              ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isLoadingBookings ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
                    </div>
                  ) : getFilteredBookings().length === 0 ? (
                    <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-850 border-dashed text-slate-400 dark:text-slate-550 text-sm">
                      No service bookings found matching the selected status filter.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getFilteredBookings().map((b) => {
                        const isPending = b.status === "Pending" || b.status === 0 || b.status === "0";
                        const isConfirmed = b.status === "Confirmed" || b.status === 1 || b.status === "1";
                        const isInProgress = b.status === "InProgress" || b.status === 2 || b.status === "2";
                        const isCompleted = b.status === "Completed" || b.status === "Paid" || b.status === 3 || b.status === 4 || b.status === "3" || b.status === "4";
                        const isCancelled = b.status === "Cancelled" || b.status === 5 || b.status === "5";
                        const isRejected = b.status === "Rejected" || b.status === 6 || b.status === "6";

                        let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350";
                        let statusText = b.statusLabel || b.status;
                        
                        if (isPending) {
                          badgeStyle = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-500/20";
                          statusText = "Pending";
                        }
                        if (isConfirmed) {
                          badgeStyle = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-500/20";
                          statusText = "Confirmed";
                        }
                        if (isInProgress) {
                          badgeStyle = "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-500/20";
                          statusText = "In Progress";
                        }
                        if (isCompleted) {
                          badgeStyle = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
                          statusText = "Completed";
                        }
                        if (isCancelled) {
                          badgeStyle = "bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-500/20";
                          statusText = "Cancelled";
                        }
                        if (isRejected) {
                          badgeStyle = "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-500/20";
                          statusText = "Rejected";
                        }

                        return (
                          <div key={b.id} className="p-5 rounded-3xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
                                    {b.service?.name || "Maintenance Service"}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${badgeStyle}`}>
                                  {statusText}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                Professional: {b.provider?.user?.name || "Vetted Expert"}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Address: <span className="font-semibold text-slate-800 dark:text-slate-200">{b.serviceDeliveryAddress || "Address not provided"}</span>
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Phone: <span className="font-semibold text-slate-800 dark:text-slate-200">{b.contactPhoneNumber || "Phone not provided"}</span>
                              </p>
                              {b.notes && (
                                <p className="text-[10px] text-slate-450 dark:text-slate-500 italic mt-1 leading-relaxed">
                                  Notes: "{b.notes}"
                                </p>
                              )}

                              {/* Paid Amount and verification details */}
                              {isCompleted && (
                                <div className="text-[10px] border-t border-slate-100 dark:border-slate-850 pt-2 mt-2 space-y-1">
                                  <p className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                    <span>Verification Status:</span>
                                    {b.isPaymentVerified ? (
                                      <span className="font-extrabold text-cyan-500">Paid & Verified (${b.paidAmount})</span>
                                    ) : b.paymentStatus === "Submitted" ? (
                                      <span className="font-bold text-amber-500 animate-pulse">Submitted for Verification (${b.paidAmount})</span>
                                    ) : (
                                      <span className="font-bold text-slate-400">Payment Pending</span>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 opacity-60 text-violet-500" />
                                Schedule: {b.slot ? `${new Date(b.slot.date).toLocaleDateString()} @ ${b.slot.startTime.substring(0, 5)}` : "Not scheduled"}
                              </div>

                              {b.providerNotes && (
                                <div className="p-2.5 rounded-xl border border-violet-500/15 bg-violet-500/5 text-[9px] text-slate-650 dark:text-slate-350">
                                  <span className="font-black text-violet-650 dark:text-violet-400 block mb-0.5">Note from Provider:</span>
                                  "{b.providerNotes}"
                                </div>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {/* Provider Profile & Book Again Navigation */}
                                <Link
                                  to="/providers/$providerId"
                                  params={{ providerId: String(b.providerId) }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-white text-[9px] font-bold text-slate-600 dark:text-slate-350 transition cursor-pointer"
                                >
                                  View Provider
                                </Link>
                                <Link
                                  to="/providers/$providerId/book"
                                  params={{ providerId: String(b.providerId) }}
                                  search={{ serviceId: String(b.serviceId), price: String(b.service?.price || b.service?.basePrice || 50) }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-[9px] font-black text-white hover:scale-[1.02] active:scale-95 transition cursor-pointer shadow-sm shadow-violet-500/10"
                                >
                                  Book Again <ChevronRight className="h-3 w-3" />
                                </Link>

                                {/* Action buttons — edit/cancel */}
                                {isPending && (
                                  <button
                                    onClick={() => { setEditingBooking(b); setEditNotes(b.notes || ""); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/5 text-[9px] font-bold text-violet-650 dark:text-violet-400 hover:bg-violet-500/10 transition cursor-pointer"
                                  >
                                    <Pencil className="h-3 w-3" /> Edit Notes
                                  </button>
                                )}
                                {(isPending || isConfirmed) && (
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-[9px] font-bold text-rose-650 dark:text-rose-455 hover:bg-rose-500/10 transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" /> Cancel
                                  </button>
                                )}

                                {/* Leave Review button */}
                                {isCompleted && b.isPaymentVerified && !b.hasCustomerReviewed && (
                                  <button
                                    onClick={() => { setReviewingBooking(b); setReviewRating(5); setReviewComment(""); }}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[9px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer shadow-sm"
                                  >
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Leave a Review
                                  </button>
                                )}

                                {/* Payment Verification input submission trigger */}
                                {isCompleted && !b.isPaymentVerified && b.paymentStatus !== "Submitted" && (
                                  <button
                                    onClick={() => { setVerifyingPaymentBooking(b); setPaidAmountInput(String(b.service?.price || 50)); setPaymentReference(""); }}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-[9px] font-bold text-white hover:from-violet-500 hover:to-cyan-400 transition cursor-pointer shadow-sm"
                                  >
                                    Verify Cash Payment
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. SECURITY & ACCESS TAB */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security & Access</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-455 mt-1">Manage and update your account password</p>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider block">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition placeholder-slate-400 dark:text-slate-100"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider block">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition placeholder-slate-400 dark:text-slate-100"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider block">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition placeholder-slate-400 dark:text-slate-100"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center justify-center bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-violet-500/25 hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Update Password
                    </button>
                  </form>
                </div>
              )}

            </div>
          </section>

        </div>
      </main>

      {/* EDIT NOTES MODAL DIALOG */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-2xl p-6 md:p-8 space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-cyan-500" />
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit Booking Notes</h3>
              <button onClick={() => setEditingBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateNotes} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Notes Details</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-3 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 resize-none transition"
                  placeholder="Enter details, access codes, or client request instructions..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingBooking(null)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-355 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="flex items-center bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer">
                  {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT PAYMENT VERIFICATION MODAL DIALOG */}
      {verifyingPaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-2xl p-6 md:p-8 space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-cyan-500" />
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Submit Payment Details</h3>
              <button onClick={() => setVerifyingPaymentBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">Please provide the payment details for verification by **{verifyingPaymentBooking.provider?.user?.name || "Professional"}**.</p>
            
            <form onSubmit={handleSubmitPaymentVerification} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Payment Method *</label>
                <select
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition text-slate-800 dark:text-slate-100"
                >
                  <option value="Cash">Cash</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Amount Paid ($) *</label>
                <input
                  type="number"
                  required
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition text-slate-800 dark:text-slate-100"
                  placeholder="50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Transaction Reference / Receipt Note *</label>
                <input
                  type="text"
                  required
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-550/45 transition text-slate-850 dark:text-slate-100"
                  placeholder="Receipt note or code (e.g. Paid cash in hand, receipt #405)"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setVerifyingPaymentBooking(null)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-355 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submittingPaymentVerification} className="flex items-center bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/25">
                  {submittingPaymentVerification ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                  Submit Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE A REVIEW MODAL DIALOG */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-2xl p-6 md:p-8 space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Submit Rating & Review</h3>
              <button onClick={() => setReviewingBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">Share your feedback about the specialist **{reviewingBooking.provider?.user?.name || "Professional"}**.</p>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star rating picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rating Score</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-slate-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Star className={`h-7 w-7 ${
                        star <= reviewRating 
                          ? "fill-amber-400 text-amber-400 drop-shadow-md" 
                          : "text-slate-300 dark:text-slate-700"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comments */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Comments</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full text-sm rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 resize-none transition"
                  placeholder="Tell us about the service quality, speed, and overall details..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReviewingBooking(null)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-355 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={reviewLoading} className="flex items-center bg-amber-550 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow shadow-amber-500/10">
                  {reviewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
