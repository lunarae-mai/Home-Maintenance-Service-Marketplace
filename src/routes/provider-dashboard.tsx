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
} from "lucide-react";
import api from "@/lib/api";

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
  customer?: any;
  service?: any;
  slot?: any;
};

const COLUMNS = ["Pending", "Confirmed", "InProgress", "Completed"];

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
    { label: "Saturday", value: 6 }
  ];

  const isSuspended = profile?.status === "Suspended";

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
        setAvailList(res.data.data.map((item: any) => ({
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime.substring(0, 5),
          endTime: item.endTime.substring(0, 5)
        })));
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

  const changeStatus = async (id: number, action: "confirm" | "reject" | "start" | "complete") => {
    if (isSuspended) return;
    try {
      let body: any = null;
      if (action === "confirm") {
        const providerNotes = window.prompt("Optional notes for the customer (e.g., 'I will arrive with my tools at 10 AM'):", "") ?? "";
        body = { providerNotes };
      }
      await api.put(`/Booking/${id}/${action}`, body);

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
    } catch (err) {
      console.error(`Failed to ${action} booking`, err);
    }
  };

  const verifyPayment = async (bookingId: number, amount: number) => {
    if (isSuspended) return;
    if (!confirm(`Confirm receipt of cash payment of $${amount} for this booking?`)) return;
    try {
      const res = await api.post("/Payments/verify-cash", {
        bookingId,
        finalAmount: amount,
        method: "Cash"
      });
      if (res.data.success) {
        alert("Payment verified successfully. Booking is now marked as Paid.");
        fetchProfileAndBookings();
      }
    } catch (err: any) {
      console.error("Failed to verify payment", err);
      alert(err.response?.data?.message || "Failed to verify payment.");
    }
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
        text: err.response?.data?.message || "Failed to change password. Please verify current password.",
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
      alert("Please select a service.");
      return;
    }
    try {
      const res = await api.post("/Providers/services", {
        serviceId: Number(selectedServiceId),
        basePrice: parseInt(servicePrice) || 50,
        details: serviceDetails,
      });
      alert(res.data.message || "Service added successfully!");
      setShowAddService(false);
      setSelectedCategoryId("");
      setSelectedServiceId("");
      setServiceDetails("");
      setServicePrice("50");
      setManualPriceAdd(false);
      fetchProfileAndBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add service.");
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
      alert(res.data.message || "Service updated successfully!");
      setShowEditService(false);
      setManualEditPriceAdd(false);
      fetchProfileAndBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update service.");
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (isSuspended) return;
    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      const res = await api.delete(`/Providers/services/${serviceId}`);
      alert(res.data.message || "Service removed successfully!");
      fetchProfileAndBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove service.");
    }
  };

  // Availability weekly handlers
  const handleToggleDay = (dayVal: number) => {
    if (isSuspended) return;
    setSelectedDays(prev => 
      prev.includes(dayVal) ? prev.filter(d => d !== dayVal) : [...prev, dayVal]
    );
  };

  const handleAddSlotWindow = () => {
    if (isSuspended) return;
    if (selectedDays.length === 0) {
      alert("Please select at least one day of the week.");
      return;
    }
    if (availStartTime >= availEndTime) {
      alert("Start time must be before end time.");
      return;
    }

    const newWindows = selectedDays.map(day => ({
      dayOfWeek: day,
      startTime: availStartTime,
      endTime: availEndTime
    }));

    setAvailList(prev => {
      const merged = [...prev];
      newWindows.forEach(nw => {
        const exists = merged.some(m => m.dayOfWeek === nw.dayOfWeek && m.startTime === nw.startTime && m.endTime === nw.endTime);
        if (!exists) merged.push(nw);
      });
      return merged;
    });

    setSelectedDays([]);
  };

  const handleRemoveSlotWindow = (index: number) => {
    if (isSuspended) return;
    setAvailList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWeeklySchedule = async () => {
    if (isSuspended) return;
    if (availList.length === 0) {
      alert("Please add at least one availability window before submitting.");
      return;
    }
    try {
      const payload = {
        slots: availList.map(item => ({
          dayOfWeek: item.dayOfWeek,
          startTime: `${item.startTime}:00`,
          endTime: `${item.endTime}:00`
        }))
      };

      const res = await api.post("/Availability/slots", payload);
      alert(res.data.message || "Weekly availability saved and time slots published successfully!");
      fetchAvailability();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update weekly availability.");
    }
  };

  // Math metrics for Analytics
  const completedJobs = bookings.filter((b) => b.status === "Completed" || b.status === "Paid");
  const totalEarnings = completedJobs.reduce((acc, b) => acc + (b.service?.price || 50.0), 0);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-200 font-sans selection:bg-purple-500/30 flex">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-md flex flex-col justify-between p-6 shrink-0">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <Home className="h-6 w-6 text-purple-500 transition-transform group-hover:scale-110" />
            <span className="font-extrabold text-white text-lg tracking-wider">HOMS PRO</span>
          </Link>

          <nav className="space-y-1.5">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => setActiveTab(n.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === n.label
                    ? "bg-gradient-to-r from-purple-600 via-indigo-650 to-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-slate-400 hover:text-white hover:bg-purple-600/10 hover:shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                }`}
              >
                <n.icon className={`h-4 w-4 ${activeTab === n.label ? "text-white" : "opacity-70"}`} />
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4 mt-auto">
          {/* Relocated Verification Badge */}
          <div className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-2.5">
            <span className={`h-2 w-2 rounded-full shrink-0 ${
              profile?.status === "Approved" 
                ? "bg-emerald-500" 
                : profile?.status === "Suspended" 
                  ? "bg-red-750" 
                  : "bg-amber-500 animate-pulse"
            }`} />
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
      <main className="flex-1 overflow-y-auto px-10 py-8 relative">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Top Header Banner */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {activeTab === "Dashboard" ? "Booking Pipeline" : activeTab}
              </h2>
              <p className="text-slate-400 text-xs mt-1">Management Console for Home Maintenance Experts</p>
            </div>
          </header>

          {/* STRICT ACCOUNT SUSPENDED BANNER */}
          {isSuspended && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-start gap-4 text-red-200 animate-pulse shadow-lg">
              <AlertTriangle className="h-6 w-6 shrink-0 text-red-500" />
              <div>
                <h4 className="font-bold text-sm text-white">Account Status: Suspended</h4>
                <p className="text-xs text-red-300/80 leading-relaxed mt-1">
                  Your account is suspended. Please contact administration. All edits, slot updates, booking acceptances, and service configurations are frozen.
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
                      Your provider application is currently pending admin approval. You can prepare your services, set availability, and manage your profile in the meantime. However, you will not receive live client booking requests on the marketplace until your status is set to Approved.
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
                    <div key={col} className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{col}</span>
                        <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-bold text-slate-300">
                          {filtered.length}
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {filtered.length > 0 ? (
                          filtered.map((b) => (
                            <div
                              key={b.id}
                              className="rounded-xl border border-white/10 bg-[#0F0F13] p-4 space-y-3 transition hover:border-purple-500/50"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-bold text-white text-xs">{b.service?.name || "Maintenance Job"}</p>
                                <span className="text-[10px] font-mono text-slate-500">#{b.id}</span>
                              </div>
                              <p className="text-[11px] text-slate-450 leading-relaxed">{b.notes || "No extra requirements provided."}</p>

                              {b.slot && (
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  Schedule: {new Date(b.slot.date).toLocaleDateString()} @ {b.slot.startTime.substring(0,5)}
                                </p>
                              )}

                              {/* Interactive State Actions */}
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {col === "Pending" && (
                                  <>
                                    <button
                                      disabled={isSuspended}
                                      onClick={() => changeStatus(b.id, "confirm")}
                                      className={`rounded-lg bg-emerald-650 hover:bg-emerald-700 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      disabled={isSuspended}
                                      onClick={() => changeStatus(b.id, "reject")}
                                      className={`rounded-lg bg-rose-650 hover:bg-rose-700 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {col === "Confirmed" && (
                                  <button
                                    disabled={isSuspended}
                                    onClick={() => changeStatus(b.id, "start")}
                                    className={`rounded-lg bg-purple-600 hover:bg-purple-750 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                  >
                                    Start Job
                                  </button>
                                )}
                                {col === "InProgress" && (
                                  <button
                                    disabled={isSuspended}
                                    onClick={() => changeStatus(b.id, "complete")}
                                    className={`rounded-lg bg-indigo-600 hover:bg-indigo-750 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                  >
                                    Complete Job
                                  </button>
                                )}
                                {col === "Completed" && (
                                  <div className="flex flex-col gap-1.5 items-start">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                                    </span>
                                    {(!b.payment || b.payment.paymentStatus !== "Paid") ? (
                                      <button
                                        disabled={isSuspended}
                                        onClick={() => verifyPayment(b.id, b.service?.price || 50)}
                                        className={`rounded-lg bg-emerald-600 hover:bg-emerald-750 px-2.5 py-1 text-[9px] font-bold text-white transition ${isSuspended ? "opacity-40 cursor-not-allowed" : ""}`}
                                      >
                                        Verify Cash Payment
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> Paid
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-6 text-slate-600 text-xs italic">No {col.toLowerCase()} requests.</p>
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
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total Finished Jobs</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{completedJobs.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total Earnings</p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-2">${totalEarnings.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total Incoming Requests</p>
                  <p className="text-3xl font-extrabold text-purple-400 mt-2">
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
                  {bookings.filter((b) => b.status === "Confirmed" || b.status === "InProgress").length > 0 ? (
                    bookings
                      .filter((b) => b.status === "Confirmed" || b.status === "InProgress")
                      .map((b) => (
                        <div key={b.id} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                          <div>
                            <p className="font-bold text-white text-sm">{b.service?.name || "Home Maintenance"}</p>
                            {b.slot && (
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(b.slot.date).toLocaleDateString()} @ {b.slot.startTime.substring(0,5)}
                              </p>
                            )}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "InProgress" ? "bg-purple-650/20 text-purple-300" : "bg-blue-650/20 text-blue-300"
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm font-medium text-slate-500 italic">No scheduled active jobs today.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS TAB VIEW */}
          {activeTab === "Payments" && (
            <div className="space-y-6 max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <h3 className="font-bold text-lg text-white mb-4">Billing Invoices</h3>
                <div className="space-y-3">
                  {completedJobs.length > 0 ? (
                    completedJobs.map((b) => (
                      <div key={b.id} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                        <div>
                          <p className="font-bold text-white text-sm">Invoice for Job #{b.id}</p>
                          <p className="text-xs text-slate-400 mt-1">{b.service?.name || "General Service"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-emerald-450 text-base">${(b.service?.price || 50).toFixed(2)}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Paid
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-slate-500 italic">No billing transactions or finished jobs recorded.</p>
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
                <p className="text-slate-450 text-xs mb-6">Define the days and time slots you are open for maintenance bookings. Submitting updates will generate active time slots for the next 7 days.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left panel: Add schedule slots */}
                  <div className="lg:col-span-1 space-y-5 bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Add Working Window</h4>
                    
                    {/* Days Checklist */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Select Days</label>
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeekOptions.map(option => (
                          <label key={option.value} className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer hover:text-white transition">
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
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Start Time</label>
                        <input 
                          type="time"
                          disabled={isSuspended}
                          value={availStartTime}
                          onChange={(e) => setAvailStartTime(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none disabled:opacity-40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">End Time</label>
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
                      className={`w-full bg-gradient-to-r from-purple-600 via-indigo-650 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl hover:brightness-110 active:scale-95 shadow-lg shadow-purple-600/20 transition-all duration-300 disabled:opacity-50 mt-4 ${isSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Add Slot Window
                    </button>
                  </div>

                  {/* Right panel: Active availability list */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure Slots Queue</h4>
                      {/* UNIFIED BUTTON: Save & Publish Schedule */}
                      <button
                        disabled={isSuspended}
                        onClick={handleSubmitWeeklySchedule}
                        className={`bg-gradient-to-r from-purple-600 via-indigo-650 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-6 rounded-xl hover:brightness-110 active:scale-95 shadow-lg shadow-purple-600/20 transition-all duration-300 disabled:opacity-50 ${isSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Save & Publish Schedule
                      </button>
                    </div>

                    {availList.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-slate-500 text-xs italic">
                        No availability slots defined. Select days and times on the left to populate your schedule.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                        {availList.map((item, index) => {
                          const dayLabel = daysOfWeekOptions.find(d => d.value === item.dayOfWeek)?.label || "Day";
                          return (
                            <div key={index} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5 transition hover:border-purple-500/30">
                              <div>
                                <p className="text-sm font-bold text-white">{dayLabel}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Hours: <span className="text-purple-400 font-semibold">{item.startTime} - {item.endTime}</span>
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
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-650 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-purple-600/30">
                      {profile.name ? profile.name.charAt(0) : "P"}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{profile.name || "Provider"}</h3>
                      <p className="text-sm text-purple-400 font-medium font-semibold tracking-wide">Service Provider Profile</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Email Address</p>
                        <p className="text-sm font-medium text-slate-200 mt-1">{profile.email || "No email"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Phone Number</p>
                        <p className="text-sm font-medium text-slate-200 mt-1">{profile.phone || "No phone"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Registered Categories</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {profile.services && profile.services.length > 0 ? (
                            profile.services.map((s: any) => (
                              <span key={s.serviceId} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white">
                                {allServicesList.find((item) => item.id === s.serviceId)?.name || `Service ${s.serviceId}`}
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
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Experience Level</p>
                        <p className="text-sm font-medium text-slate-200 mt-1">{profile.experience || 1} Years in industry</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Professional Bio</p>
                    <p className="text-sm text-slate-350 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                      {profile.bio ? `"${profile.bio}"` : "No bio provided yet. Update in settings."}
                    </p>
                  </div>

                  {/* SERVICES LIST SECTION */}
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Services Offered</p>
                      {/* UNIFIED BUTTON: Add Service */}
                      <button
                        disabled={isSuspended}
                        onClick={() => setShowAddService(!showAddService)}
                        className={`bg-gradient-to-r from-purple-600 via-indigo-650 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-6 rounded-xl hover:brightness-110 active:scale-95 shadow-lg shadow-purple-600/20 transition-all duration-300 disabled:opacity-50 ${isSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {showAddService ? "Cancel" : "Add Service"}
                      </button>
                    </div>

                    {showAddService && (
                      <form onSubmit={handleAddService} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Add New Service</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Service Category</label>
                            <select
                              value={selectedCategoryId}
                              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
                              className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/45"
                              required
                            >
                              <option value="">-- Select Category --</option>
                              {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Service Name / Title</label>
                            <select
                              value={selectedServiceId}
                              onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : "")}
                              className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/45"
                              disabled={!selectedCategoryId}
                              required
                            >
                              {servicesForCategory.length === 0 ? (
                                <option value="">-- Select Category First --</option>
                              ) : (
                                servicesForCategory.map((s: any) => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>

                        {/* Price Input with Manual Toggle */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] text-slate-400 font-bold uppercase block">Base Price ($)</label>
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
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Service Details / Description</label>
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
                          <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-650 px-5 py-2 text-xs font-bold text-white hover:brightness-110 active:scale-95 transition"
                          >
                            Submit Service
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Active Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.services && profile.services.length > 0 ? (
                        profile.services.map((s: any) => (
                          <div key={s.serviceId} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4.5 transition hover:border-purple-550/20">
                            <div>
                              <p className="text-sm font-bold text-white">
                                {allServicesList.find((item) => item.id === s.serviceId)?.name || `Service ${s.serviceId}`}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">Base Price: <span className="text-emerald-400 font-bold">${Math.round(s.basePrice)}</span></p>
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
                        <p className="text-sm font-medium text-slate-500 col-span-2">No services registered.</p>
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
                <div className={`p-4 rounded-xl text-sm font-medium border ${
                  statusMessage.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-255" 
                    : "bg-red-500/10 border-red-500/30 text-red-255"
                }`}>
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
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold" htmlFor="name">
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
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold" htmlFor="bio">
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
                    className={`bg-gradient-to-r from-purple-600 via-indigo-650 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-6 rounded-xl hover:brightness-110 active:scale-95 shadow-lg shadow-purple-600/20 transition-all duration-300 disabled:opacity-50 ${isSuspended ? "cursor-not-allowed" : ""}`}
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
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold" htmlFor="current">
                      Current Password
                    </label>
                    <input
                      id="current"
                      type="password"
                      disabled={isSuspended}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold" htmlFor="new">
                      New Password
                    </label>
                    <input
                      id="new"
                      type="password"
                      disabled={isSuspended}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold" htmlFor="confirm">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm"
                      type="password"
                      disabled={isSuspended}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550/40 disabled:opacity-40"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSuspended}
                    className={`bg-gradient-to-r from-purple-600 via-indigo-650 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-6 rounded-xl hover:brightness-110 active:scale-95 shadow-lg shadow-purple-600/20 transition-all duration-300 disabled:opacity-50 ${isSuspended ? "cursor-not-allowed" : ""}`}
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
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Edit Service Offering</h3>
            <form onSubmit={handleEditServiceSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Base Price ($)</label>
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
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Service Details / Description</label>
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
    </div>
  );
}
