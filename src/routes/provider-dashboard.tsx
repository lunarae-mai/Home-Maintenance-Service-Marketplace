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
  const [servicePrice, setServicePrice] = useState("50.00");
  const [allServicesList, setAllServicesList] = useState<any[]>([]);
  const [slotGenLoading, setSlotGenLoading] = useState(false);

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

        // Fetch incoming and today schedule
        const [incoming, today] = await Promise.all([
          api.get(`/Booking/provider/${pId}/incoming-requests`),
          api.get(`/Booking/provider/${pId}/today-schedule`),
        ]);

        let allBookings: Booking[] = [];
        if (incoming.data.success) allBookings = [...allBookings, ...incoming.data.data];
        if (today.data.success) {
          const existingIds = new Set(allBookings.map((b) => b.id));
          const newToday = today.data.data.filter((b: Booking) => !existingIds.has(b.id));
          allBookings = [...allBookings, ...newToday];
        }
        setBookings(allBookings);
      }
    } catch (err) {
      console.error("Could not load data from backend.", err);
    }
  };

  useEffect(() => {
    fetchProfileAndBookings();
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

  const changeStatus = async (id: number, action: "confirm" | "reject" | "start" | "complete") => {
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
    } catch (err) {
      console.error(`Failed to ${action} booking`, err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!selectedServiceId) {
      alert("Please select a service.");
      return;
    }
    try {
      const res = await api.post("/Providers/services", {
        serviceId: Number(selectedServiceId),
        basePrice: parseFloat(servicePrice) || 50.0,
        details: serviceDetails,
      });
      alert(res.data.message || "Service added successfully!");
      setShowAddService(false);
      setSelectedCategoryId("");
      setSelectedServiceId("");
      setServiceDetails("");
      setServicePrice("50.00");
      fetchProfileAndBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add service.");
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      const res = await api.delete(`/Providers/services/${serviceId}`);
      alert(res.data.message || "Service removed successfully!");
      fetchProfileAndBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove service.");
    }
  };

  const handleGenerateSlots = async () => {
    setSlotGenLoading(true);
    try {
      const res = await api.post("/Slots/generate?daysAhead=7");
      alert(res.data.message || "Time slots generated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate time slots.");
    } finally {
      setSlotGenLoading(false);
    }
  };

  // Math metrics for Analytics
  const completedJobs = bookings.filter((b) => b.status === "Completed");
  const totalEarnings = completedJobs.reduce((acc, b) => acc + (b.service?.price || 50.0), 0);
  const activeJobs = bookings.filter((b) => b.status === "InProgress" || b.status === "Confirmed").length;
  const completionRate = bookings.length ? Math.round((completedJobs.length / bookings.length) * 100) : 100;

  return (
    <div className="flex min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-purple-500/30">
      {/* Decorative Blur Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <aside className="relative z-10 hidden w-64 shrink-0 border-r border-white/10 bg-black/40 p-6 backdrop-blur-2xl lg:flex lg:flex-col">
        <Link to="/" className="mb-8 flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-105">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold tracking-tight text-white">Provider Console</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Home Services</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => {
                setActiveTab(n.label);
                setStatusMessage({ type: "", text: "" });
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                activeTab === n.label
                  ? "bg-white/10 text-white shadow-inner border border-white/5"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <n.icon className={`h-4 w-4 ${activeTab === n.label ? "text-purple-400" : "opacity-70"}`} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Verification status</p>
            <p className={`mt-1.5 text-xs font-bold tracking-wider ${approved ? "text-emerald-400" : "text-amber-400"}`}>
              {approved ? "• SYSTEM APPROVED" : "• PENDING APPROVAL"}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto">
        {!approved && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-3.5 text-sm text-amber-200 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <p className="flex-1">
                Your account is currently pending admin approval. You will gain full access once approved.
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl px-8 py-10">
          {/* HEADER */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold">{activeTab} View</p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {activeTab === "Dashboard" ? "Booking pipeline" : activeTab}
              </h1>
            </div>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "Dashboard" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
              {COLUMNS.map((col) => {
                const items = bookings.filter((b) => b.status === col);
                return (
                  <div key={col} className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {col}
                      </h3>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {items.length === 0 && (
                        <p className="rounded-xl border border-dashed border-white/10 py-10 text-center text-xs text-slate-500">
                          No {col.toLowerCase()} jobs
                        </p>
                      )}
                      {items.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-lg hover:border-white/15 transition-all duration-300"
                        >
                          <p className="text-sm font-bold text-white">{b.customer?.name || "Anonymous Client"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{b.service?.name || "Home Service"}</p>
                          {b.notes && (
                            <p className="text-xs text-slate-500 italic mt-1.5 border-l-2 border-purple-500/30 pl-2">
                              "{b.notes}"
                            </p>
                          )}
                          <p className="mt-2.5 text-xs font-medium text-cyan-400">
                            {b.slot ? `${new Date(b.slot.date).toLocaleDateString()} | ${b.slot.startTime} - ${b.slot.endTime}` : "Scheduled Time"}
                          </p>
                          {col === "Pending" && approved && (
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => changeStatus(b.id, "confirm")}
                                className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:brightness-110 active:scale-95 transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => changeStatus(b.id, "reject")}
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-400 hover:border-red-500 hover:text-red-400 transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {col === "Confirmed" && approved && (
                            <button
                              onClick={() => changeStatus(b.id, "start")}
                              className="mt-4 w-full rounded-lg border border-cyan-400/50 bg-cyan-400/10 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400 hover:text-black transition"
                            >
                              Mark In Progress
                            </button>
                          )}
                          {col === "InProgress" && approved && (
                            <button
                              onClick={() => changeStatus(b.id, "complete")}
                              className="mt-4 w-full rounded-lg border border-emerald-400/50 bg-emerald-400/10 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400 hover:text-black transition"
                            >
                              Complete Job
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "Analytics" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Total Earnings</p>
                  <p className="mt-2 text-4xl font-extrabold text-emerald-400">${totalEarnings.toFixed(2)}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Based on completed contracts</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Completion Rate</p>
                  <p className="mt-2 text-4xl font-extrabold text-purple-400">{completionRate}%</p>
                  <p className="mt-1 text-[10px] text-slate-500">Accepted vs. finished ratio</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Active Schedule</p>
                  <p className="mt-2 text-4xl font-extrabold text-cyan-400">{activeJobs}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Jobs currently active or confirmed</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Customer Rating</p>
                  <p className="mt-2 text-4xl font-extrabold text-amber-400">4.9 ★</p>
                  <p className="mt-1 text-[10px] text-slate-500">Aggregate provider rating</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-4 text-white">Performance Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Total Registered Bookings ({bookings.length})</span>
                      <span>{bookings.length} jobs</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Completed Contracts ({completedJobs.length})</span>
                      <span>{completionRate}% rate</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Bookings" && (
            <div className="space-y-6">
              {approved && (
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white">Time Slot Generation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Generate daily booking slots based on your availability template.</p>
                  </div>
                  <button
                    onClick={handleGenerateSlots}
                    disabled={slotGenLoading}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition"
                  >
                    {slotGenLoading ? "Generating..." : "Generate 7-Day Slots"}
                  </button>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md overflow-hidden">
              <h3 className="font-bold text-lg mb-6 text-white">Incoming Service Request Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-400 font-bold">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Date/Time</th>
                      <th className="py-3 px-4">Special Notes</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500 italic">No bookings scheduled yet.</td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 font-semibold text-white">
                            {b.customer?.name || "Client"}
                            <span className="block text-[10px] font-normal text-slate-400">{b.customer?.phone || "No phone"}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-300">{b.service?.name || "Service ID " + b.serviceId}</td>
                          <td className="py-4 px-4 text-slate-300">
                            {b.slot ? `${new Date(b.slot.date).toLocaleDateString()} | ${b.slot.startTime}` : "TBD"}
                          </td>
                          <td className="py-4 px-4 text-slate-400 italic max-w-xs truncate">
                            {b.notes ? `"${b.notes}"` : "—"}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              b.status === "Pending" ? "bg-amber-500/15 text-amber-400" :
                              b.status === "Confirmed" ? "bg-cyan-500/15 text-cyan-400" :
                              b.status === "InProgress" ? "bg-blue-500/15 text-blue-400" :
                              "bg-emerald-500/15 text-emerald-400"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

          {activeTab === "Payments" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <h3 className="font-bold text-lg mb-6 text-white">Financial Ledger & Payout History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-400 font-bold">
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Service Performed</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Amount Earned</th>
                        <th className="py-3 px-4 text-right">Payout Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {completedJobs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-500 italic">No payments received yet. Completed jobs will show up here.</td>
                        </tr>
                      ) : (
                        completedJobs.map((b, idx) => (
                          <tr key={b.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-slate-400 font-mono">TXN-00{idx + 1}-{b.id}</td>
                            <td className="py-4 px-4 text-slate-300">{b.service?.name || "Service ID " + b.serviceId}</td>
                            <td className="py-4 px-4 text-slate-300">{b.customer?.name || "Client"}</td>
                            <td className="py-4 px-4 font-bold text-emerald-400">${(b.service?.price || 50.0).toFixed(2)}</td>
                            <td className="py-4 px-4 text-right">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400">
                                Transferred
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Profile" && (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md max-w-3xl">
              {profile ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-purple-500/20">
                      {profile.name ? profile.name.charAt(0) : "P"}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{profile.name || "Provider"}</h3>
                      <p className="text-sm text-purple-400 font-medium">Service Provider Profile</p>
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
                    <p className="text-sm text-slate-300 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                      {profile.bio ? `"${profile.bio}"` : "No bio provided yet. Update in settings."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Services Offered</p>
                      {approved && (
                        <button
                          onClick={() => setShowAddService(!showAddService)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
                        >
                          {showAddService ? "Cancel" : "Add Service"}
                        </button>
                      )}
                    </div>

                    {showAddService && approved && (
                      <form onSubmit={handleAddService} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Add New Service</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Service Category</label>
                            <select
                              value={selectedCategoryId}
                              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
                              className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
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
                              className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
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

                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Base Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={servicePrice}
                            onChange={(e) => setServicePrice(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                            placeholder="50.00"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Service Details / Description</label>
                          <textarea
                            rows={3}
                            value={serviceDetails}
                            onChange={(e) => setServiceDetails(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
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
                            className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 active:scale-95 transition"
                          >
                            Submit Service
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.services && profile.services.length > 0 ? (
                        profile.services.map((s: any) => (
                          <div key={s.serviceId} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5">
                            <div>
                              <p className="text-sm font-bold text-white">
                                {allServicesList.find((item) => item.id === s.serviceId)?.name || `Service ${s.serviceId}`}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">Base Price: <span className="text-emerald-400 font-semibold">${s.basePrice.toFixed(2)}</span></p>
                            </div>
                            {approved && (
                              <button
                                onClick={() => handleDeleteService(s.serviceId)}
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 transition"
                              >
                                Remove
                              </button>
                            )}
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

          {activeTab === "Settings" && (
            <div className="space-y-8 max-w-3xl">
              {statusMessage.text && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${
                  statusMessage.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" 
                    : "bg-red-500/10 border-red-500/30 text-red-200"
                }`}>
                  {statusMessage.text}
                </div>
              )}

              {/* PROFILE SETTINGS FORM */}
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
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-95 transition"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              {/* CHANGE PASSWORD FORM */}
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
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-95 transition"
                  >
                    Change Access Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
