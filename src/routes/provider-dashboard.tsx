import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  CalendarCheck,
  Wallet,
  UserCog,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Home,
  LogOut,
  User,
  Mail,
  Phone,
  Briefcase,
  Lock,
  Clock,
  Loader2,
  DollarSign,
  Star,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/provider-dashboard")({
  component: ProviderDashboard,
});

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Analytics", icon: BarChart3 },
  { label: "Bookings", icon: CalendarCheck },
  { label: "Payments", icon: Wallet },
  { label: "Availability", icon: Clock },
  { label: "Profile", icon: UserCog },
  { label: "Settings", icon: Settings },
];

type Booking = {
  id: number;
  customerId: string;
  serviceId: number;
  slotId: number;
  status: string;
  notes: string;
  providerNotes?: string;
  serviceDeliveryAddress?: string;
  contactPhoneNumber?: string;
  isPaymentVerified?: boolean;
  paymentStatus?: string;
  paidAmount?: number;
  paymentMethod?: string;
  hasCustomerReviewed?: boolean;
  hasProviderReviewed?: boolean;
  customer?: any;
  service?: any;
  slot?: any;
};

const COLUMNS = ["Pending", "Confirmed", "InProgress", "Completed"];
const ACTION_BUTTON_CLASS =
  "bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-6 rounded-xl hover:brightness-110 active:scale-95 shadow-lg shadow-violet-600/20 transition-all duration-300 disabled:opacity-50";

const CATEGORY_MAP: Record<number, string> = {
  1: "Plumbing",
  2: "Electrical",
  3: "Cleaning",
  4: "Painting",
  5: "General Repairs",
};

function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [approved, setApproved] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookingReviews, setBookingReviews] = useState<Record<number, any[]>>({});

  // Expanded Booking ID state
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);

  // Customer Summary Modal States
  const [customerSummaryId, setCustomerSummaryId] = useState<string | null>(null);
  const [customerSummaryData, setCustomerSummaryData] = useState<any | null>(null);
  const [isLoadingCustomerSummary, setIsLoadingCustomerSummary] = useState(false);

  // Provider-to-Customer Review States
  const [ratingCustomerBooking, setRatingCustomerBooking] = useState<any | null>(null);
  const [customerRatingValue, setCustomerRatingValue] = useState(5);
  const [customerRatingComment, setCustomerRatingComment] = useState("");
  const [submittingCustomerRating, setSubmittingCustomerRating] = useState(false);

  // Modal / dialog state
  const [reviewDialogBooking, setReviewDialogBooking] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  const [promptDialog, setPromptDialog] = useState<{
    title: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
  } | null>(null);
  const [promptInputValue, setPromptInputValue] = useState("");

  // Settings edit states
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Add Service Form/Modal States
  const [showAddService, setShowAddService] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [servicesForCategory, setServicesForCategory] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  const [serviceDetails, setServiceDetails] = useState("");
  const [servicePrice, setServicePrice] = useState("50");
  const [manualPriceAdd, setManualPriceAdd] = useState(false);
  const [allServicesList, setAllServicesList] = useState<any[]>([]);

  // Edit Service Modal States
  const [showEditService, setShowEditService] = useState(false);
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  const [editServicePrice, setEditServicePrice] = useState("50");
  const [editServiceDetails, setEditServiceDetails] = useState("");
  const [manualEditPriceAdd, setManualEditPriceAdd] = useState(false);

  // Availability Management States
  const [availList, setAvailList] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [availStartTime, setAvailStartTime] = useState("09:00");
  const [availEndTime, setAvailEndTime] = useState("17:00");

  const daysOfWeekOptions = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  const isSuspended = profile?.status === "Suspended";

  const getBookingAmount = (booking: Booking) => {
    const amount = Number(booking.paidAmount ?? booking.service?.price ?? 50);
    return Number.isFinite(amount) ? amount : 0;
  };

  const fetchProfileAndBookings = async () => {
    try {
      const profRes = await api.get("/Providers/profile");
      if (profRes.data.success) {
        const profData = profRes.data.data;
        const isApproved = profData.status === "Approved";
        setApproved(isApproved);
        setProfile(profData);
        setEditName(profData.name || "");
        setEditBio(profData.bio || "");

        const pId = profData.id || 5;
        setProviderId(pId);

        // Fetch comprehensive list of bookings for the provider
        const res = await api.get(`/Booking/provider/my-bookings`);
        if (res.data.success) {
          setBookings(res.data.data);
        }
      }
    } catch (err) {
      console.error("Could not load data from backend.", err);
    }
  };

  useEffect(() => {
    fetchProfileAndBookings();
    const interval = setInterval(fetchProfileAndBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!customerSummaryId) {
      setCustomerSummaryData(null);
      return;
    }
    const fetchCustomerSummary = async () => {
      setIsLoadingCustomerSummary(true);
      try {
        const res = await api.get(`/Review/customer/${customerSummaryId}`);
        if (res.data.success) {
          setCustomerSummaryData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch customer summary", err);
      } finally {
        setIsLoadingCustomerSummary(false);
      }
    };
    fetchCustomerSummary();
  }, [customerSummaryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/Service/categories");
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch service categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const res = await api.get("/Service/search?pageSize=100");
        if (res.data.success) {
          setAllServicesList(res.data.data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch all services list", err);
      }
    };
    fetchAllServices();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setServicesForCategory([]);
      setSelectedServiceId("");
      return;
    }
    const fetchServices = async () => {
      try {
        const res = await api.get(`/Service/categories/${selectedCategoryId}/services`);
        if (res.data.success) {
          setServicesForCategory(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedServiceId(res.data.data[0].id);
          } else {
            setSelectedServiceId("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    };
    fetchServices();
  }, [selectedCategoryId]);

  const fetchAvailability = async () => {
    try {
      const res = await api.get("/Slots/availability");
      if (res.data.success) {
        setAvailList(
          res.data.data.map((item: any) => ({
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime.substring(0, 5),
            endTime: item.endTime.substring(0, 5),
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch availability", err);
    }
  };

  useEffect(() => {
    if (activeTab === "Availability") {
      fetchAvailability();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Payments") {
      return;
    }

    const completedBookingIds = bookings
      .filter((booking) => booking.status === "Completed" || booking.status === "Paid")
      .map((booking) => booking.id);

    if (completedBookingIds.length === 0) {
      setBookingReviews({});
      return;
    }

    let isMounted = true;

    const loadBookingReviews = async () => {
      try {
        const entries = await Promise.all(
          completedBookingIds.map(async (bookingId) => {
            const res = await api.get(`/Review/booking/${bookingId}`);
            return {
              bookingId,
              reviews: res.data?.success ? res.data.data : [],
            };
          }),
        );

        if (!isMounted) {
          return;
        }

        setBookingReviews(
          entries.reduce<Record<number, any[]>>((acc, entry) => {
            acc[entry.bookingId] = entry.reviews;
            return acc;
          }, {}),
        );
      } catch (err) {
        console.error("Failed to fetch booking reviews", err);
      }
    };

    loadBookingReviews();

    return () => {
      isMounted = false;
    };
  }, [activeTab, bookings]);

  const changeStatus = async (id: number, action: "confirm" | "reject" | "start" | "complete") => {
    if (isSuspended) return;
    if (action === "confirm") {
      setPromptDialog({
        title: "Add booking notes",
        message: "Share a short note with the customer before confirming this job.",
        placeholder: "I will arrive with my tools at 10 AM",
        defaultValue: "",
        onConfirm: async (providerNotes) => {
          try {
            await api.put(`/Booking/${id}/${action}`, { providerNotes });
            const newStatusMap: Record<string, string> = {
              confirm: "Confirmed",
              reject: "Rejected",
              start: "InProgress",
              complete: "Completed",
            };
            setBookings((prev) =>
              prev.map((b) => (b.id === id ? { ...b, status: newStatusMap[action] } : b)),
            );
            toast.success("Booking confirmed successfully.");
          } catch (err) {
            console.error(`Failed to ${action} booking`, err);
            toast.error("Unable to confirm this booking right now.");
          } finally {
            setPromptDialog(null);
            setPromptInputValue("");
          }
        },
      });
      return;
    }

    try {
      await api.put(`/Booking/${id}/${action}`);

      const newStatusMap: Record<string, string> = {
        confirm: "Confirmed",
        reject: "Rejected",
        start: "InProgress",
        complete: "Completed",
      };

      if (action === "reject") {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatusMap[action] } : b)),
        );
      }
      toast.success(`Booking ${action === "reject" ? "rejected" : "updated"} successfully.`);
    } catch (err) {
      console.error(`Failed to ${action} booking`, err);
      toast.error("Unable to update this booking right now.");
    }
  };

  const verifyPayment = async (bookingId: number, amount: number) => {
    if (isSuspended) return;
    setConfirmDialog({
      title: "Verify cash payment",
      message: `Confirm receipt of cash payment of $${amount.toFixed(2)} for this booking?`,
      confirmLabel: "Confirm Payment",
      onConfirm: async () => {
        try {
          const res = await api.post("/Payments/verify-cash", {
            bookingId,
            finalAmount: amount,
            method: "Cash",
          });
          if (res.data.success) {
            toast.success("Payment verified successfully. Booking is now marked as Paid.");
            fetchProfileAndBookings();
          }
        } catch (err: any) {
          console.error("Failed to verify payment", err);
          toast.error(err.response?.data?.message || "Failed to verify payment.");
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleSubmitCustomerRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingCustomerBooking) return;
    setSubmittingCustomerRating(true);
    try {
      await api.post("/reviews/Customer", {
        bookingId: ratingCustomerBooking.id,
        rating: customerRatingValue,
        comment: customerRatingComment,
      });
      toast.success("Customer review submitted successfully!");
      setRatingCustomerBooking(null);
      setCustomerRatingComment("");
      setCustomerRatingValue(5);
      fetchProfileAndBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit customer review.");
    } finally {
      setSubmittingCustomerRating(false);
    }
  };

  const handleConfirmPaymentReceived = async (bookingId: number) => {
    if (isSuspended) return;
    setConfirmDialog({
      title: "Confirm payment receipt",
      message: "Confirm that you have received this payment from the customer?",
      confirmLabel: "Confirm",
      onConfirm: async () => {
        try {
          const res = await api.post(`/Booking/${bookingId}/confirm-payment`);
          if (res.data.success) {
            toast.success("Payment verified and booking marked as fully Paid!");
            fetchProfileAndBookings();
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to confirm payment.");
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;
    setStatusMessage({ type: "", text: "" });
    try {
      const res = await api.put("/Providers/profile", {
        name: editName,
        bio: editBio,
      });
      if (res.data.success) {
        setStatusMessage({ type: "success", text: "Profile settings saved successfully!" });
        setProfile((prev: any) => ({ ...prev, name: editName, bio: editBio }));
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile settings.",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;
    setStatusMessage({ type: "", text: "" });
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    try {
      const res = await api.post("/User/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      if (res.data.success) {
        setStatusMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to change password. Please verify current password.",
      });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    navigate({ to: "/" });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;
    if (!selectedServiceId) {
      toast.error("Please select a service.");
      return;
    }
    try {
      const res = await api.post("/Providers/services", {
        serviceId: Number(selectedServiceId),
        basePrice: parseInt(servicePrice) || 50,
        details: serviceDetails,
      });
      toast.success(res.data.message || "Service added successfully!");
      setShowAddService(false);
      setSelectedCategoryId("");
      setSelectedServiceId("");
      setServiceDetails("");
      setServicePrice("50");
      setManualPriceAdd(false);
      fetchProfileAndBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add service.");
    }
  };

  const handleOpenEditService = (s: any) => {
    if (isSuspended) return;
    setEditServiceId(s.serviceId);
    setEditServicePrice(Math.round(s.basePrice).toString());
    setEditServiceDetails(s.details || "");
    setManualEditPriceAdd(false);
    setShowEditService(true);
  };

  const handleEditServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;
    if (!editServiceId) return;
    try {
      const res = await api.put("/Service/edit", {
        serviceId: Number(editServiceId),
        basePrice: parseInt(editServicePrice) || 50,
        description: editServiceDetails,
      });
      toast.success(res.data.message || "Service updated successfully!");
      setShowEditService(false);
      setManualEditPriceAdd(false);
      fetchProfileAndBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update service.");
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (isSuspended) return;
    setConfirmDialog({
      title: "Remove service",
      message: "Are you sure you want to remove this service?",
      confirmLabel: "Remove",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/Providers/services/${serviceId}`);
          toast.success(res.data.message || "Service removed successfully!");
          fetchProfileAndBookings();
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to remove service.");
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // Availability weekly handlers
  const handleToggleDay = (dayVal: number) => {
    if (isSuspended) return;
    setSelectedDays((prev) =>
      prev.includes(dayVal) ? prev.filter((d) => d !== dayVal) : [...prev, dayVal],
    );
  };

  const handleAddSlotWindow = () => {
    if (isSuspended) return;
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day of the week.");
      return;
    }
    if (availStartTime >= availEndTime) {
      toast.error("Start time must be before end time.");
      return;
    }

    const newWindows = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime: availStartTime,
      endTime: availEndTime,
    }));

    setAvailList((prev) => {
      const merged = [...prev];
      newWindows.forEach((nw) => {
        const exists = merged.some(
          (m) =>
            m.dayOfWeek === nw.dayOfWeek &&
            m.startTime === nw.startTime &&
            m.endTime === nw.endTime,
        );
        if (!exists) merged.push(nw);
      });
      return merged;
    });

    setSelectedDays([]);
  };

  const handleRemoveSlotWindow = (index: number) => {
    if (isSuspended) return;
    setAvailList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWeeklySchedule = async () => {
    if (isSuspended) return;
    if (availList.length === 0) {
      toast.error("Please add at least one availability window before submitting.");
      return;
    }
    try {
      const payload = {
        slots: availList.map((item) => ({
          dayOfWeek: item.dayOfWeek,
          startTime: `${item.startTime}:00`,
          endTime: `${item.endTime}:00`,
        })),
      };

      const res = await api.post("/Availability/slots", payload);
      toast.success(
        res.data.message || "Weekly availability saved and time slots published successfully!",
      );
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update weekly availability.");
    }
  };

  // Math metrics for Analytics
  const completedJobs = bookings.filter((b) => b.status === "Completed" || b.status === "Paid");
  const verifiedPaidJobs = completedJobs.filter(
    (booking) =>
      booking.isPaymentVerified || booking.status === "Paid" || booking.paymentStatus === "Paid",
  );
  const totalEarnings = verifiedPaidJobs.reduce(
    (acc, booking) => acc + getBookingAmount(booking),
    0,
  );

  return (
    <div className="min-h-screen bg-[#070b16] text-foreground font-sans selection:bg-violet-500/30 flex">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-white/10 bg-[#0b1224] backdrop-blur-md flex flex-col justify-between p-6 shrink-0">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <Home className="h-6 w-6 text-violet-500 transition-transform group-hover:scale-110" />
          </Link>

          <nav className="space-y-1.5">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => setActiveTab(n.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === n.label
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-white hover:bg-violet-500/10 hover:shadow-[0_0_10px_rgba(109,40,217,0.1)]"
                }`}
              >
                <n.icon
                  className={`h-4 w-4 ${activeTab === n.label ? "text-white" : "opacity-70"}`}
                />
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4 mt-auto">
          {/* Relocated Verification Badge */}
          <div className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-2.5">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                profile?.status === "Approved"
                  ? "bg-emerald-500"
                  : profile?.status === "Suspended"
                    ? "bg-red-750"
                    : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="text-[11px] font-bold text-slate-350 uppercase tracking-wider">
              {profile?.status === "PendingApproval" ? "In Review" : profile?.status || "Pending"}
            </span>
          </div>

          {/* REDESIGNED Pill-Shaped Red exit bubble */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-rose-500/30 bg-rose-500/10 text-sm font-extrabold text-rose-400 hover:bg-rose-600 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all duration-300 active:scale-95"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[radial-gradient(circle_at_top_right,_rgba(109,40,217,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.16),_transparent_30%)]">
        <Toaster richColors position="top-right" expand />
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Top Header Banner */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {activeTab === "Dashboard" ? "Booking Pipeline" : activeTab}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Management Console for Home Maintenance Experts
              </p>
            </div>
          </header>

          {/* STRICT ACCOUNT SUSPENDED BANNER */}
          {isSuspended && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-start gap-4 text-red-200 animate-pulse shadow-lg">
              <AlertTriangle className="h-6 w-6 shrink-0 text-red-500" />
              <div>
                <h4 className="font-bold text-sm text-white">Account Status: Suspended</h4>
                <p className="text-xs text-red-300/80 leading-relaxed mt-1">
                  Your account is suspended. Please contact administration. All edits, slot updates,
                  booking acceptances, and service configurations are frozen.
                </p>
              </div>
            </div>
          )}

          {/* DASHBOARD TAB VIEW */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              {profile?.status === "PendingApproval" && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-start gap-4 text-amber-250">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Verification Under Review</h4>
                    <p className="text-xs text-amber-300/80 leading-relaxed mt-1">
                      Your provider application is currently pending admin approval. You can prepare
                      your services, set availability, and manage your profile in the meantime.
                      However, you will not receive live client booking requests on the marketplace
                      until your status is set to Approved.
                    </p>
                  </div>
                </div>
              )}

              {/* Booking States Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {COLUMNS.map((col) => {
                  const filtered = bookings.filter((b) => {
                    if (col === "Completed") return b.status === "Completed" || b.status === "Paid";
                    return b.status === col;
                  });
                  return (
                    <div
                      key={col}
                      className="rounded-2xl border border-white/10 bg-[#111827] p-4 space-y-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          {col}
                        </span>
                        <span className="rounded-lg bg-violet-500/10 px-2 py-0.5 text-xs font-bold text-violet-300">
                          {filtered.length}
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {filtered.length > 0 ? (
                          filtered.map((b) => {
                            const isExpanded = expandedBookingId === b.id;
                            return (
                              <div
                                key={b.id}
                                className="rounded-xl border border-white/10 bg-[#0f172a] p-4 space-y-3 shadow-sm transition hover:border-violet-500/50 hover:shadow-md"
                              >
                                <div
                                  className="flex justify-between items-start gap-2 cursor-pointer"
                                  onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                                >
                                  <div>
                                    <p className="font-bold text-white text-xs hover:text-violet-400 transition">
                                      {b.service?.name || "Maintenance Job"}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">
                                      Click to toggle details
                                    </p>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    #{b.id}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                  {b.notes || "No extra requirements provided."}
                                </p>

                                {b.slot && (
                                  <p className="text-[10px] text-slate-450 font-semibold">
                                    Schedule: {new Date(b.slot.date).toLocaleDateString()} @{" "}
                                    {b.slot.startTime.substring(0, 5)}
                                  </p>
                                )}

                                {/* Expanded customer information */}
                                {isExpanded && (
                                  <div className="p-3 rounded-lg bg-[#111827] border border-white/10 space-y-2 text-[10px] text-slate-300 animate-in slide-in-from-top-2 duration-200">
                                    <p className="font-bold text-slate-400 border-b border-white/10 pb-1 uppercase tracking-wider text-[8px]">
                                      Client Information
                                    </p>
                                    <p>
                                      <span className="font-bold text-slate-200">Name:</span>{" "}
                                      {b.customer?.name || "Anonymous Client"}
                                    </p>
                                    <p>
                                      <span className="font-bold text-slate-200">Address:</span>{" "}
                                      {b.serviceDeliveryAddress || "Address not provided"}
                                    </p>
                                    <p>
                                      <span className="font-bold text-slate-200">
                                        Contact Phone:
                                      </span>{" "}
                                      {b.contactPhoneNumber || "Phone not provided"}
                                    </p>

                                    <button
                                      onClick={() =>
                                        b.customer?.id && setCustomerSummaryId(b.customer.id)
                                      }
                                      className="mt-2 w-full text-center bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold py-1.5 rounded-md shadow hover:from-violet-500 hover:to-cyan-400 transition cursor-pointer"
                                    >
                                      View Customer History / Reviews
                                    </button>
                                  </div>
                                )}

                                {/* Interactive State Actions */}
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                  {col === "Pending" && (
                                    <>
                                      <button
                                        disabled={isSuspended}
                                        onClick={() => changeStatus(b.id, "confirm")}
                                        className={`rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                      >
                                        Accept
                                      </button>
                                      <button
                                        disabled={isSuspended}
                                        onClick={() => changeStatus(b.id, "reject")}
                                        className={`rounded-lg bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {col === "Confirmed" && (
                                    <button
                                      disabled={isSuspended}
                                      onClick={() => changeStatus(b.id, "start")}
                                      className={`rounded-lg bg-violet-600 hover:bg-violet-500 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                    >
                                      Start Job
                                    </button>
                                  )}
                                  {col === "InProgress" && (
                                    <button
                                      disabled={isSuspended}
                                      onClick={() => changeStatus(b.id, "complete")}
                                      className={`rounded-lg bg-cyan-600 hover:bg-cyan-500 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                    >
                                      Complete Job
                                    </button>
                                  )}
                                  {col === "Completed" && (
                                    <div className="flex flex-col gap-1.5 items-start">
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                                      </span>
                                      {b.isPaymentVerified ? (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400">
                                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>{" "}
                                          Paid & Verified (${b.paidAmount})
                                        </span>
                                      ) : b.paymentStatus === "Submitted" ? (
                                        <div className="mt-1 space-y-1">
                                          <span className="text-[9px] block text-amber-500 font-bold animate-pulse leading-normal">
                                            Verification Pending: ${b.paidAmount} via{" "}
                                            {b.paymentMethod || "Cash"}
                                          </span>
                                          <button
                                            disabled={isSuspended}
                                            onClick={() => handleConfirmPaymentReceived(b.id)}
                                            className={`rounded bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 px-2.5 py-1 text-[9px] font-extrabold text-white transition cursor-pointer ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                          >
                                            Confirm Payment Received
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-slate-400 block font-semibold">
                                            Payment Pending
                                          </span>
                                          <button
                                            disabled={isSuspended}
                                            onClick={() => verifyPayment(b.id, getBookingAmount(b))}
                                            className={`rounded-lg bg-emerald-600 hover:bg-emerald-750 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                          >
                                            Verify Cash Payment
                                          </button>
                                        </div>
                                      )}
                                      {b.isPaymentVerified && !b.hasProviderReviewed && (
                                        <button
                                          onClick={() => {
                                            setRatingCustomerBooking(b);
                                            setCustomerRatingValue(5);
                                            setCustomerRatingComment("");
                                          }}
                                          className="mt-1.5 flex items-center gap-1 rounded bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 text-[9px] font-bold text-amber-400 border border-amber-500/10 transition cursor-pointer"
                                        >
                                          Rate Customer
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-center py-6 text-slate-600 text-xs italic">
                            No {col.toLowerCase()} requests.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB VIEW */}
          {activeTab === "Analytics" && (
            <div className="w-full space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)] min-h-[170px]">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Total Finished Jobs
                  </p>
                  <p className="text-4xl font-extrabold text-white mt-3">{completedJobs.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)] min-h-[170px]">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Total Earnings
                  </p>
                  <p className="text-4xl font-extrabold text-emerald-400 mt-3">
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)] min-h-[170px]">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Total Incoming Requests
                  </p>
                  <p className="text-4xl font-extrabold text-cyan-400 mt-3">
                    {bookings.filter((b) => b.status === "Pending").length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS TAB VIEW */}
          {activeTab === "Bookings" && (
            <div className="space-y-6 max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <h3 className="font-bold text-lg text-white mb-4">Confirmed Schedules</h3>
                <div className="space-y-3">
                  {bookings.filter((b) => b.status === "Confirmed" || b.status === "InProgress")
                    .length > 0 ? (
                    bookings
                      .filter((b) => b.status === "Confirmed" || b.status === "InProgress")
                      .map((b) => (
                        <div
                          key={b.id}
                          className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4"
                        >
                          <div>
                            <p className="font-bold text-white text-sm">
                              {b.service?.name || "Home Maintenance"}
                            </p>
                            {b.slot && (
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(b.slot.date).toLocaleDateString()} @{" "}
                                {b.slot.startTime.substring(0, 5)}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === "InProgress"
                                ? "bg-purple-650/20 text-purple-300"
                                : "bg-blue-650/20 text-blue-300"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm font-medium text-slate-500 italic">
                      No scheduled active jobs today.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS TAB VIEW */}
          {activeTab === "Payments" && (
            <div className="w-full space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <h3 className="font-bold text-lg text-white mb-5">Billing Invoices</h3>
                <div className="space-y-3">
                  {completedJobs.length > 0 ? (
                    completedJobs.map((b) => {
                      const invoiceAmount = getBookingAmount(b);
                      const reviews = bookingReviews[b.id] || [];
                      const ratingValue =
                        reviews.length > 0
                          ? (
                              reviews.reduce(
                                (sum: number, review: any) => sum + Number(review.rating || 0),
                                0,
                              ) / reviews.length
                            ).toFixed(1)
                          : "N/A";
                      const isVerified = b.isPaymentVerified || b.status === "Paid";

                      return (
                        <div
                          key={b.id}
                          className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_0.9fr_auto] gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm">Invoice for Job #{b.id}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {b.service?.name || "General Service"}
                            </p>
                            <div className="mt-3">
                              <p className="font-extrabold text-emerald-400 text-lg">
                                ${invoiceAmount.toFixed(2)}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-emerald-400/90 mt-1">
                                {isVerified ? "verified" : "pending"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                              Customer
                            </p>
                            <p className="text-sm font-semibold text-slate-200 mt-1">
                              {b.customer?.name || "Customer"}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                              Job Rating
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-amber-400">
                              <Star className="h-4 w-4 fill-amber-400" />
                              <span className="text-sm font-semibold text-slate-200">
                                {ratingValue}
                              </span>
                              {reviews.length > 0 ? (
                                <span className="text-[10px] text-slate-500">
                                  / {reviews.length} review{reviews.length === 1 ? "" : "s"}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center justify-start lg:justify-end">
                            <button
                              type="button"
                              onClick={() => setReviewDialogBooking({ booking: b, reviews })}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-extrabold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-white"
                            >
                              View Review
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-medium text-slate-500 italic">
                      No billing transactions or finished jobs recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB VIEW (Expanded Full-Width layout) */}
          {activeTab === "Availability" && (
            <div className="space-y-8 w-full animate-in fade-in duration-300">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <h3 className="font-bold text-xl text-white mb-2 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-purple-400" />
                  Weekly Availability Schedule
                </h3>
                <p className="text-slate-450 text-xs mb-6">
                  Define the days and time slots you are open for maintenance bookings. Submitting
                  updates will generate active time slots for the next 7 days.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left panel: Add schedule slots */}
                  <div className="lg:col-span-1 space-y-5 bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                      Add Working Window
                    </h4>

                    {/* Days Checklist */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">
                        Select Days
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeekOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer hover:text-white transition"
                          >
                            <input
                              type="checkbox"
                              disabled={isSuspended}
                              checked={selectedDays.includes(option.value)}
                              onChange={() => handleToggleDay(option.value)}
                              className="accent-purple-500 rounded border-white/10 bg-black focus:ring-0 disabled:opacity-40"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Start & End Times */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                          Start Time
                        </label>
                        <input
                          type="time"
                          disabled={isSuspended}
                          value={availStartTime}
                          onChange={(e) => setAvailStartTime(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none disabled:opacity-40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                          End Time
                        </label>
                        <input
                          type="time"
                          disabled={isSuspended}
                          value={availEndTime}
                          onChange={(e) => setAvailEndTime(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none disabled:opacity-40"
                        />
                      </div>
                    </div>

                    {/* UNIFIED BUTTON: Add Slot Window */}
                    <button
                      type="button"
                      disabled={isSuspended}
                      onClick={handleAddSlotWindow}
                      className={`w-full mt-4 ${ACTION_BUTTON_CLASS} ${isSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Add Slot Window
                    </button>
                  </div>

                  {/* Right panel: Active availability list */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Configure Slots Queue
                      </h4>
                      {/* UNIFIED BUTTON: Save & Publish Schedule */}
                      <button
                        disabled={isSuspended}
                        onClick={handleSubmitWeeklySchedule}
                        className={`${ACTION_BUTTON_CLASS} ${isSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Save & Publish Schedule
                      </button>
                    </div>

                    {availList.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-slate-500 text-xs italic">
                        No availability slots defined. Select days and times on the left to populate
                        your schedule.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                        {availList.map((item, index) => {
                          const dayLabel =
                            daysOfWeekOptions.find((d) => d.value === item.dayOfWeek)?.label ||
                            "Day";
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5 transition hover:border-purple-500/30"
                            >
                              <div>
                                <p className="text-sm font-bold text-white">{dayLabel}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Hours:{" "}
                                  <span className="text-purple-400 font-semibold">
                                    {item.startTime} - {item.endTime}
                                  </span>
                                </p>
                              </div>
                              <button
                                disabled={isSuspended}
                                onClick={() => handleRemoveSlotWindow(index)}
                                className={`px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-[10px] font-extrabold text-rose-350 hover:bg-rose-500/20 transition active:scale-95 ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB VIEW (Expanded Full-Width layout) */}
          {activeTab === "Profile" && (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md w-full animate-in fade-in duration-300">
              {profile ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                    {/* UNIFIED GRADIENT AVATAR BACKGROUND */}
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-600 via-cyan-500 to-violet-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-violet-600/30">
                      {profile.name ? profile.name.charAt(0) : "P"}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {profile.name || "Provider"}
                      </h3>
                      <p className="text-sm text-purple-400 font-medium font-semibold tracking-wide">
                        Service Provider Profile
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                          Email Address
                        </p>
                        <p className="text-sm font-medium text-slate-200 mt-1">
                          {profile.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                          Phone Number
                        </p>
                        <p className="text-sm font-medium text-slate-200 mt-1">
                          {profile.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                          Registered Categories
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {profile.services && profile.services.length > 0 ? (
                            profile.services.map((s: any) => (
                              <span
                                key={s.serviceId}
                                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white"
                              >
                                {allServicesList.find((item) => item.id === s.serviceId)?.name ||
                                  `Service ${s.serviceId}`}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm font-medium text-slate-400">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                          Experience Level
                        </p>
                        <p className="text-sm font-medium text-slate-200 mt-1">
                          {profile.experience || 1} Years in industry
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">
                      Professional Bio
                    </p>
                    <p className="text-sm text-slate-350 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                      {profile.bio
                        ? `"${profile.bio}"`
                        : "No bio provided yet. Update in settings."}
                    </p>
                  </div>

                  {/* SERVICES LIST SECTION */}
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                        Services Offered
                      </p>
                      {/* UNIFIED BUTTON: Add Service */}
                      <button
                        disabled={isSuspended}
                        onClick={() => setShowAddService(!showAddService)}
                        className={`${ACTION_BUTTON_CLASS} ${isSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {showAddService ? "Cancel" : "Add Service"}
                      </button>
                    </div>

                    {showAddService && (
                      <form
                        onSubmit={handleAddService}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl"
                      >
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Add New Service
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                              Service Category
                            </label>
                            <select
                              value={selectedCategoryId}
                              onChange={(e) =>
                                setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")
                              }
                              className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/45"
                              required
                            >
                              <option value="">-- Select Category --</option>
                              {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                              Service Name / Title
                            </label>
                            <select
                              value={selectedServiceId}
                              onChange={(e) =>
                                setSelectedServiceId(e.target.value ? Number(e.target.value) : "")
                              }
                              className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/45"
                              disabled={!selectedCategoryId}
                              required
                            >
                              {servicesForCategory.length === 0 ? (
                                <option value="">-- Select Category First --</option>
                              ) : (
                                servicesForCategory.map((s: any) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>

                        {/* Price Input with Manual Toggle */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] text-slate-400 font-bold uppercase block">
                              Base Price ($)
                            </label>
                            <button
                              type="button"
                              onClick={() => setManualPriceAdd(!manualPriceAdd)}
                              className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition"
                            >
                              {manualPriceAdd ? "Use Selector" : "Add Manually"}
                            </button>
                          </div>
                          <input
                            type={manualPriceAdd ? "text" : "number"}
                            step={manualPriceAdd ? undefined : "1"}
                            value={servicePrice}
                            onChange={(e) => setServicePrice(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/45"
                            placeholder="50"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                            Service Details / Description
                          </label>
                          <textarea
                            rows={3}
                            value={serviceDetails}
                            onChange={(e) => setServiceDetails(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/45"
                            placeholder="Describe what is included in this service..."
                            required
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddService(false)}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
                          >
                            Cancel
                          </button>
                          <button type="submit" className={`${ACTION_BUTTON_CLASS} px-5 py-2`}>
                            Submit Service
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Active Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.services && profile.services.length > 0 ? (
                        profile.services.map((s: any) => (
                          <div
                            key={s.serviceId}
                            className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4.5 transition hover:border-purple-550/20"
                          >
                            <div>
                              <p className="text-sm font-bold text-white">
                                {allServicesList.find((item) => item.id === s.serviceId)?.name ||
                                  `Service ${s.serviceId}`}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Base Price:{" "}
                                <span className="text-emerald-400 font-bold">
                                  ${Math.round(s.basePrice)}
                                </span>
                              </p>
                              {s.details && (
                                <p className="text-[11px] text-slate-500 mt-1.5 italic line-clamp-2 max-w-[200px]">
                                  {s.details}
                                </p>
                              )}
                            </div>
                            {/* UNIFIED ACTION BUBBLES IN GRID */}
                            <div className="flex gap-3">
                              <button
                                disabled={isSuspended}
                                onClick={() => handleOpenEditService(s)}
                                className={`px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-extrabold text-purple-300 hover:bg-purple-600/20 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 active:scale-95 ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                Edit Profile
                              </button>
                              <button
                                disabled={isSuspended}
                                onClick={() => handleDeleteService(s.serviceId)}
                                className={`px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-[10px] font-extrabold text-rose-350 hover:bg-rose-600/20 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all duration-300 active:scale-95 ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                Remove Offer
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm font-medium text-slate-500 col-span-2">
                          No services registered.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500">Loading profile data...</p>
              )}
            </div>
          )}

          {/* SETTINGS TAB VIEW (Expanded Full-Width layout) */}
          {activeTab === "Settings" && (
            <div className="space-y-8 w-full animate-in fade-in duration-300">
              {statusMessage.text && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium border ${
                    statusMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-255"
                      : "bg-red-500/10 border-red-500/30 text-red-255"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-purple-400" />
                  <h3 className="font-bold text-lg text-white">Profile Customization</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-wider text-slate-400 font-bold"
                      htmlFor="name"
                    >
                      Display Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      disabled={isSuspended}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-wider text-slate-400 font-bold"
                      htmlFor="bio"
                    >
                      Professional Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      disabled={isSuspended}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSuspended}
                    className={`${ACTION_BUTTON_CLASS} ${isSuspended ? "cursor-not-allowed" : ""}`}
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-purple-400" />
                  <h3 className="font-bold text-lg text-white">Access Settings & Security</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-wider text-slate-400 font-bold"
                      htmlFor="current"
                    >
                      Current Password
                    </label>
                    <input
                      id="current"
                      type="password"
                      disabled={isSuspended}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-wider text-slate-400 font-bold"
                      htmlFor="new"
                    >
                      New Password
                    </label>
                    <input
                      id="new"
                      type="password"
                      disabled={isSuspended}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-wider text-slate-400 font-bold"
                      htmlFor="confirm"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirm"
                      type="password"
                      disabled={isSuspended}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSuspended}
                    className={`${ACTION_BUTTON_CLASS} ${isSuspended ? "cursor-not-allowed" : ""}`}
                  >
                    Change Access Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* EDIT SERVICE MODAL */}
      {showEditService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F13] shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Edit Service Offering
            </h3>
            <form onSubmit={handleEditServiceSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">
                    Base Price ($)
                  </label>
                  <button
                    type="button"
                    onClick={() => setManualEditPriceAdd(!manualEditPriceAdd)}
                    className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition"
                  >
                    {manualEditPriceAdd ? "Use Selector" : "Add Manually"}
                  </button>
                </div>
                <input
                  type={manualEditPriceAdd ? "text" : "number"}
                  step={manualEditPriceAdd ? undefined : "1"}
                  value={editServicePrice}
                  onChange={(e) => setEditServicePrice(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                  Service Details / Description
                </label>
                <textarea
                  rows={3}
                  value={editServiceDetails}
                  onChange={(e) => setEditServiceDetails(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Describe what is included in this service..."
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditService(false);
                    setManualEditPriceAdd(false);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-650 px-5 py-2 text-xs font-bold text-white hover:brightness-110 active:scale-95 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW DETAIL MODAL */}
      {reviewDialogBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F13] shadow-2xl p-6 md:p-8 space-y-5">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-cyan-500" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Customer Review</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Feedback for Job #{reviewDialogBooking.booking.id}
                </p>
              </div>
              <button
                onClick={() => setReviewDialogBooking(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const customerReview =
                reviewDialogBooking.reviews.find(
                  (review: any) => review.reviewerType === "Customer",
                ) ||
                reviewDialogBooking.reviews[0] ||
                null;

              return customerReview ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        Reviewer
                      </p>
                      <p className="text-sm font-semibold text-slate-200 mt-1">
                        {customerReview.reviewerName ||
                          reviewDialogBooking.booking.customer?.name ||
                          "Customer"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="text-sm font-semibold text-slate-200">
                        {customerReview.rating}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                      Review
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {customerReview.comment || "No written feedback was provided for this job."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
                  No review has been submitted for this job yet.
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setReviewDialogBooking(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER REVIEWS & HISTORY MODAL DIALOG */}
      {customerSummaryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F13] shadow-2xl p-6 md:p-8 space-y-6">
            {/* Top gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-indigo-650" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Customer Profile Summary</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reviews and historical notes left by other service providers
                </p>
              </div>
              <button
                onClick={() => setCustomerSummaryId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {isLoadingCustomerSummary ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : customerSummaryData ? (
              <div className="space-y-4">
                {/* Overall Rating Section */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Overall Rating
                    </p>
                    <p className="text-2xl font-black text-white mt-1">
                      {customerSummaryData.averageRating > 0
                        ? customerSummaryData.averageRating.toFixed(1)
                        : "N/A"}
                      <span className="text-xs text-slate-550 font-medium"> / 5.0</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300">
                      ({customerSummaryData.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Reviews History List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Professional History Logs
                  </h4>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {customerSummaryData.reviews && customerSummaryData.reviews.length > 0 ? (
                      customerSummaryData.reviews.map((rev: any) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-white">
                                {rev.reviewerName || "Professional Specialist"}
                              </p>
                              <p className="text-[9px] text-slate-500 mt-0.5">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-slate-300">{rev.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-slate-400 text-xs italic">
                        No professional review notes written for this customer yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-6 text-slate-450 text-xs italic">
                Failed to load customer reviews details.
              </p>
            )}

            {/* Close footer button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCustomerSummaryId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F0F13] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{confirmDialog.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{confirmDialog.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
              >
                {confirmDialog.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMPT MODAL */}
      {promptDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F0F13] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{promptDialog.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{promptDialog.message}</p>
            <textarea
              value={promptInputValue}
              onChange={(e) => setPromptInputValue(e.target.value)}
              rows={4}
              placeholder={promptDialog.placeholder}
              className="mt-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPromptDialog(null);
                  setPromptInputValue("");
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => promptDialog.onConfirm(promptInputValue)}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RATE CUSTOMER MODAL DIALOG */}
      {ratingCustomerBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F13] shadow-2xl p-6 md:p-8 space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Rate Customer</h3>
              <button
                onClick={() => setRatingCustomerBooking(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Share your feedback about the client **
              {ratingCustomerBooking.customer?.name || "Customer"}** for booking **#
              {ratingCustomerBooking.id}**.
            </p>

            <form onSubmit={handleSubmitCustomerRating} className="space-y-4">
              {/* Star rating picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Rating Score
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCustomerRatingValue(star)}
                      className="p-1 text-slate-305 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= customerRatingValue
                            ? "fill-amber-400 text-amber-400 drop-shadow-md"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comments */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Comments / Notes
                </label>
                <textarea
                  value={customerRatingComment}
                  onChange={(e) => setCustomerRatingComment(e.target.value)}
                  rows={3}
                  className="w-full text-sm rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 resize-none transition"
                  placeholder="Share details about client communication, accessibility, guidelines..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingCustomerBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCustomerRating}
                  className="flex items-center bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow shadow-amber-500/10"
                >
                  {submittingCustomerRating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  ) : null}
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
