import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  DollarSign,
  Calendar,
  Zap,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import api, { getApiData } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Console — Home Services" }] }),
});

type Pending = {
  id: string;
  name: string;
  category: string;
  status: "REVIEW" | "APPROVED" | "REJECTED";
  initials: string;
  provider: any;
};

const NAV = [
  { label: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { label: "Profile", id: "profile", icon: UserIcon },
  { label: "Providers", id: "providers", icon: Users },
  { label: "Verification", id: "verification", icon: ShieldCheck },
  { label: "System", id: "system", icon: Activity },
];

function getInitials(name: string) {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getProfileImageUrl(profileImageUrl?: string | null) {
  if (!profileImageUrl) return null;
  if (/^https?:\/\//i.test(profileImageUrl)) return profileImageUrl;
  return `http://localhost:5000${profileImageUrl}`;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [providers, setProviders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [rows, setRows] = useState<Pending[]>([]);
  const [metrics, setMetrics] = useState<any[]>([
    { label: "Transaction Volume", value: "$0", sub: "calculating...", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Customer Base", value: "0", sub: "calculating...", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Bookings", value: "0", sub: "calculating...", icon: Calendar, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "System Latency", value: "0ms", sub: "stable", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10" },
  ]);
  const [adminProfile, setAdminProfile] = useState<any>({
    name: "Mariam Khaled",
    email: "admin@homeservices.com",
    role: "Admin",
    joinDate: "Jan 15, 2024",
    status: "Active",
    profileImageUrl: null,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileFormErrors, setProfileFormErrors] = useState({ name: "", email: "" });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState({ loading: false, error: "", success: "" });
  
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [meResult, metricsResult, providersResult, usersResult] = await Promise.allSettled([
        api.get("/User/me"),
        api.get("/Admin/metrics"),
        api.get("/Admin/providers"),
        api.get("/User"),
      ]);

      if (meResult.status === "fulfilled") {
        const profile = getApiData<any>(meResult.value);
        if (profile) {
          setAdminProfile({
            name: profile.name || "Administrator",
            email: profile.email || "admin@homeservices.com",
            role: profile.userRole || profile.role || "Admin",
            joinDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Jan 15, 2024",
            status: "Active",
            profileImageUrl: profile.profileImageUrl || null,
          });
          setProfileForm({
            name: profile.name || "Administrator",
            email: profile.email || "admin@homeservices.com",
          });
        }
      }

      if (metricsResult.status === "fulfilled") {
        const metricsData = getApiData<any>(metricsResult.value) ?? {};
        setMetrics([
          {
            label: "Transaction Volume",
            value: `$${(metricsData.transactionVolume ?? 0).toLocaleString()}`,
            sub: "Real-time sum",
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
          },
          {
            label: "Customer Base",
            value: (metricsData.customerBase ?? 0).toString(),
            sub: "Registered customers",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Total Bookings",
            value: (metricsData.totalBookings ?? 0).toString(),
            sub: "System total",
            icon: Calendar,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
          },
          {
            label: "System Latency",
            value: `${metricsData.systemLatency ?? 0}ms`,
            sub: "Stable",
            icon: Zap,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
          },
        ]);
      }

      if (providersResult.status === "fulfilled") {
        const providerPayload = getApiData<any[]>(providersResult.value);
        const providerList = Array.isArray(providerPayload) ? providerPayload : [];
        setProviders(providerList);
        setRows(
          providerList
            .filter((p: any) => (p.status || "").toString().toLowerCase() === "pendingapproval")
            .map((p: any) => ({
              id: p.providerId?.toString() || "",
              name: p.providerName || "Unknown Provider",
              category: p.offeredServices?.[0] || "General Repairs",
              status: "REVIEW" as const,
              initials: getInitials(p.providerName || "Unknown Provider"),
              provider: p,
            })),
        );
      }

      if (usersResult.status === "fulfilled") {
        const userPayload = getApiData<any[]>(usersResult.value);
        setUsers(Array.isArray(userPayload) ? userPayload : []);
      }
    } catch (err) {
      console.error("Failed to load admin console data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isEditingProfile) {
      setProfileForm({ name: adminProfile.name || "", email: adminProfile.email || "" });
    }
  }, [adminProfile.name, adminProfile.email, isEditingProfile]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: "", success: "" });
    try {
      await api.post("/User/change-password", passwordData);
      setPasswordStatus({ loading: false, error: "", success: "Password updated successfully." });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setShowPasswordForm(false), 2000);
    } catch (err: any) {
      setPasswordStatus({
        loading: false,
        error: err.response?.data?.message || "Failed to update password. Check credentials.",
        success: "",
      });
    }
  };

  const navigate = useNavigate();

  const handleProviderApproval = async (
    providerId: string,
    statusAction: "APPROVED" | "REJECTED",
  ) => {
    try {
      const action = statusAction === "APPROVED" ? "approve" : "reject";
      await api.put(`/Admin/providers/${providerId}/${action}`);
      await loadData();
    } catch (err) {
      console.error("Error approving/rejecting provider", err);
    } finally {
      setSelectedProvider(null);
    }
  };

  const handleUpdateStatus = async (providerId: number, statusAction: "APPROVED" | "REJECTED") => {
    try {
      const action = statusAction === "APPROVED" ? "approve" : "reject";
      await api.put(`/Admin/providers/${providerId}/${action}`);
      await loadData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const validateProfileForm = () => {
    const nextErrors = { name: "", email: "" };

    if (!profileForm.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!profileForm.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(profileForm.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setProfileFormErrors(nextErrors);
    return !nextErrors.name && !nextErrors.email;
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileStatus({ loading: false, error: "Image must be smaller than 5 MB.", success: "" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setProfileStatus({ loading: false, error: "Unsupported image format. Use JPG, PNG, or WEBP.", success: "" });
      return;
    }

    setProfileStatus({ loading: false, error: "", success: "" });
    setProfileImageFile(file);
    setProfileImagePreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setProfileStatus({ loading: true, error: "", success: "" });

    try {
      let imageUrl = adminProfile.profileImageUrl || null;

      if (profileImageFile) {
        const formData = new FormData();
        formData.append("image", profileImageFile);

        const imageResponse = await api.post("/User/me/admin/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const avatarPayload = getApiData<any>(imageResponse);
        imageUrl = avatarPayload?.profileImageUrl || avatarPayload?.data?.profileImageUrl || imageUrl;
      }

      const profileResponse = await api.put("/User/me/admin", {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });

      const refreshedProfile = getApiData<any>(profileResponse);
      const nextProfile = {
        ...adminProfile,
        name: refreshedProfile?.name || profileForm.name.trim(),
        email: refreshedProfile?.email || profileForm.email.trim(),
        role: refreshedProfile?.role || adminProfile.role,
        joinDate: adminProfile.joinDate,
        status: adminProfile.status,
        profileImageUrl: refreshedProfile?.profileImageUrl || imageUrl || adminProfile.profileImageUrl,
      };

      setAdminProfile(nextProfile);
      setProfileForm({ name: nextProfile.name, email: nextProfile.email });
      setProfileImageFile(null);
      if (profileImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview);
      }
      setProfileImagePreview(null);
      localStorage.setItem("userEmail", nextProfile.email);
      setIsEditingProfile(false);
      setProfileStatus({ loading: false, error: "", success: "Profile updated successfully." });
    } catch (err: any) {
      setProfileStatus({
        loading: false,
        error: err.response?.data?.message || "Failed to update profile. Please try again.",
        success: "",
      });
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({ name: adminProfile.name || "", email: adminProfile.email || "" });
    setProfileFormErrors({ name: "", email: "" });
    setProfileImageFile(null);
    if (profileImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImagePreview(null);
    setProfileStatus({ loading: false, error: "", success: "" });
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("adminLoginTime");
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="text-sm font-semibold tracking-wider text-slate-400 animate-pulse">
            Establishing Command Center Connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <aside className="relative z-10 hidden w-72 flex-col border-r border-white/10 bg-black/40 p-6 backdrop-blur-2xl lg:flex">
        <Link to="/" className="mb-10 flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold tracking-tight text-white">Home Services Admin</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Command Center</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                activeTab === n.id
                  ? "bg-white/10 text-white shadow-inner border border-white/5"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <n.icon
                className={`h-5 w-5 ${activeTab === n.id ? "text-cyan-400" : "opacity-70"}`}
              />
              {n.label}
              {activeTab === n.id && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
          <div
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition"
            onClick={() => setActiveTab("profile")}
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shrink-0 overflow-hidden">
              {getProfileImageUrl(adminProfile.profileImageUrl) ? (
                <img
                  src={getProfileImageUrl(adminProfile.profileImageUrl)!}
                  alt={adminProfile.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
                  {getInitials(adminProfile.name)}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate w-full">{adminProfile.name}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition border border-transparent hover:border-rose-500/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-6xl">
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">
                  Platform Overview
                </h1>
                <p className="mt-2 text-slate-400">
                  Real-time metrics and operational status for the entire marketplace.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {m.label}
                      </p>
                      <div className={`rounded-lg p-2 ${m.bg}`}>
                        <m.icon className={`h-4 w-4 ${m.color}`} />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-black text-white">{m.value}</p>
                    <p className="mt-1 text-sm font-medium text-emerald-400">{m.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="border-b border-white/10 bg-white/5 p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Provider Pipeline</h2>
                    <p className="text-sm text-slate-400">
                      Applications awaiting security clearance.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                    {rows.length} Pending
                  </div>
                </div>
                
                {rows.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 text-sm font-semibold italic">
                    All applications reviewed. No pending approvals in pipeline.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-widest text-slate-500 bg-black/20">
                          <th className="px-6 py-4 font-bold">Provider</th>
                          <th className="px-6 py-4 font-bold">Category</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rows.map((r) => (
                          <tr
                            key={r.id}
                            onClick={() => setSelectedProvider(r.provider)}
                            className="transition-colors hover:bg-white/5 cursor-pointer group"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 text-sm font-bold text-white shadow-inner group-hover:from-purple-500 group-hover:to-cyan-500 transition-colors">
                                  {r.initials}
                                </div>
                                <span className="font-semibold text-slate-200">{r.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                                {r.category}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <StatusBadge status="PendingApproval" />
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="text-xs font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                VIEW DETAILS →
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-4 backdrop-blur-sm">
              <div className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F13] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="relative shrink-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500">
                  <div className="h-32 w-full" />
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white transition hover:bg-black/40 backdrop-blur-md"
                  >
                    ✕
                  </button>
                  <div className="absolute -bottom-10 left-8 h-20 w-20 rounded-2xl border-4 border-[#0F0F13] bg-gradient-to-tr from-slate-700 to-slate-900 p-0.5 shadow-xl">
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-black text-2xl font-black text-white">
                      {getInitials(selectedProvider.providerName || selectedProvider.name || "Provider")}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-8 pt-14 pb-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedProvider.providerName || selectedProvider.name || "Unnamed Provider"}
                      </h2>
                      <p className="font-medium text-cyan-400">
                        {Array.isArray(selectedProvider.offeredServices) && selectedProvider.offeredServices.length > 0
                          ? selectedProvider.offeredServices[0]
                          : "Professional Service Provider"}
                      </p>
                    </div>
                    <StatusBadge status={selectedProvider.status || "PendingApproval"} />
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Email Address
                      </p>
                      <p className="text-sm font-medium text-slate-200">
                        {selectedProvider.email || "Not provided"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Phone Number
                      </p>
                      <p className="text-sm font-medium text-slate-200">
                        {selectedProvider.phone || "Not provided"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Bio
                      </p>
                      <p className="text-sm font-medium text-slate-200">
                        {selectedProvider.bio || "No biography provided."}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Experience
                      </p>
                      <p className="text-sm font-medium text-slate-200">
                        {selectedProvider.experience || "Not provided"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Offered Services
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedProvider.offeredServices) && selectedProvider.offeredServices.length > 0 ? (
                          selectedProvider.offeredServices.map((serviceName: string, index: number) => (
                            <span key={`${serviceName}-${index}`} className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
                              {serviceName}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-slate-400">No services listed.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 shrink-0 border-t border-white/10 bg-[#0F0F13]/95 px-8 py-4 backdrop-blur">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleProviderApproval(selectedProvider.providerId?.toString() || selectedProvider.id?.toString() || "", "REJECTED")}
                      className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm font-bold text-rose-400 transition hover:bg-rose-500 hover:text-white"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleProviderApproval(selectedProvider.providerId?.toString() || selectedProvider.id?.toString() || "", "APPROVED")}
                      className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">
                  Administrator Profile
                </h1>
                <p className="mt-2 text-slate-400">
                  Manage your credentials and security settings.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
                <div className="h-32 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 relative">
                  <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-2xl border-4 border-[#0F0F13] bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shadow-xl overflow-hidden">
                    {getProfileImageUrl(adminProfile.profileImageUrl) || profileImagePreview ? (
                      <img
                        src={profileImagePreview || getProfileImageUrl(adminProfile.profileImageUrl)!}
                        alt={adminProfile.name}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-xl bg-black flex items-center justify-center text-3xl font-black text-white">
                        {getInitials(adminProfile.name)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-8 pt-16 pb-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{adminProfile.name}</h2>
                      <p className="text-cyan-400 font-medium">{adminProfile.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400 border border-emerald-500/20">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        System Online
                      </span>
                      {!isEditingProfile ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                          Edit Profile
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {profileStatus.error ? (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        {profileStatus.error}
                      </div>
                    ) : null}
                    {profileStatus.success ? (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {profileStatus.success}
                      </div>
                    ) : null}

                    {isEditingProfile ? (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start">
                          <div className="flex-1">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                              Profile Picture
                            </label>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleProfileImageChange}
                              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-cyan-300 hover:file:bg-cyan-500/30"
                            />
                            <p className="mt-2 text-xs text-slate-500">JPG, JPEG, PNG, or WEBP up to 5 MB.</p>
                          </div>
                          {profileImagePreview ? (
                            <img
                              src={profileImagePreview}
                              alt="Preview"
                              className="h-24 w-24 rounded-2xl object-cover border border-white/10"
                            />
                          ) : getProfileImageUrl(adminProfile.profileImageUrl) ? (
                            <img
                              src={getProfileImageUrl(adminProfile.profileImageUrl)!}
                              alt="Current profile"
                              className="h-24 w-24 rounded-2xl object-cover border border-white/10"
                            />
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Full Name
                        </p>
                        {isEditingProfile ? (
                          <div>
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                            />
                            {profileFormErrors.name ? (
                              <p className="mt-2 text-xs text-rose-300">{profileFormErrors.name}</p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-slate-200 font-medium">{adminProfile.name}</p>
                        )}
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Email Address
                        </p>
                        {isEditingProfile ? (
                          <div>
                            <input
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                            />
                            {profileFormErrors.email ? (
                              <p className="mt-2 text-xs text-rose-300">{profileFormErrors.email}</p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-slate-200 font-medium">{adminProfile.email}</p>
                        )}
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Access Level
                        </p>
                        <p className="text-slate-200 font-medium flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-purple-400" />
                          Full Clearance
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Member Since
                        </p>
                        <p className="text-slate-200 font-medium">{adminProfile.joinDate}</p>
                      </div>
                    </div>

                    {isEditingProfile ? (
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleCancelProfileEdit}
                          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={profileStatus.loading || !profileForm.name.trim() || !/^\S+@\S+\.\S+$/.test(profileForm.email.trim())}
                          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {profileStatus.loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    ) : null}
                  </form>

                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
                    <div className="space-y-3">
                      {!showPasswordForm ? (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="w-full flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10 group"
                        >
                          <div>
                            <p className="font-semibold text-slate-200 text-left">
                              Change Password
                            </p>
                            <p className="text-sm text-slate-400">
                              Update your account credentials regularly.
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1" />
                        </button>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                          <h4 className="mb-4 font-bold text-white">Update Password</h4>
                          {passwordStatus.error && (
                            <p className="mb-3 text-xs text-rose-400 bg-rose-500/10 p-2 rounded">
                              {passwordStatus.error}
                            </p>
                          )}
                          {passwordStatus.success && (
                            <p className="mb-3 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded">
                              {passwordStatus.success}
                            </p>
                          )}
                          <form onSubmit={handleChangePassword} className="space-y-3">
                            <input
                              type="password"
                              placeholder="Current Password"
                              required
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                            <input
                              type="password"
                              placeholder="New Password"
                              required
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                              }
                              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                            <input
                              type="password"
                              placeholder="Confirm New Password"
                              required
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                type="button"
                                onClick={() => setShowPasswordForm(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={passwordStatus.loading}
                                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-600 transition disabled:opacity-50"
                              >
                                Save changes
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "providers" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white">Registered Providers</h1>
                  <p className="mt-2 text-slate-400">View performance stats and manage credentials for all service providers.</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-bold w-fit">
                  {providers.length} Total Providers • {users.length} Users
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-widest text-slate-500 bg-black/20">
                        <th className="px-6 py-4 font-bold">Provider Name</th>
                        <th className="px-6 py-4 font-bold">Rating</th>
                        <th className="px-6 py-4 font-bold">Offered Services</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {providers.map((p) => (
                        <tr key={p.providerId} className="transition-colors hover:bg-white/5">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 text-sm font-bold text-white shadow-inner">
                                {getInitials(p.providerName)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-200">{p.providerName}</div>
                                <div className="text-xs text-slate-400">{p.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-200">{p.avgRating ? p.avgRating.toFixed(1) : "5.0"}</span>
                              <span className="text-amber-400">★</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1 max-w-[240px]">
                              {p.offeredServices && p.offeredServices.length > 0 ? (
                                p.offeredServices.map((serviceName: string) => (
                                  <span key={serviceName} className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                                    {serviceName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 text-xs italic">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                to="/admin/providers/$id"
                                params={{ id: p.providerId.toString() }}
                                className="inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition border border-white/10"
                              >
                                View Profile
                              </Link>
                              
                              {(p.status === "PendingApproval" || p.status === "Rejected") && (
                                <button
                                  onClick={() => handleUpdateStatus(p.providerId, "APPROVED")}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white px-3 py-1.5 text-xs font-semibold text-emerald-400 transition border border-emerald-500/20"
                                >
                                  Approve
                                </button>
                              )}

                              {(p.status === "PendingApproval" || p.status === "Approved") && (
                                <button
                                  onClick={() => handleUpdateStatus(p.providerId, "REJECTED")}
                                  className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white px-3 py-1.5 text-xs font-semibold text-rose-400 transition border border-rose-500/20"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && activeTab !== "profile" && activeTab !== "providers" && (
            <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5">
              <div className="text-center">
                <Activity className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <p className="text-lg font-bold text-slate-400">Module Initializing...</p>
                <p className="text-sm text-slate-500">
                  The {activeTab} panel is currently under maintenance.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    PendingApproval: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  } as const;

  const displayNames = {
    PendingApproval: "In Review",
    Approved: "Approved",
    Rejected: "Rejected",
    Suspended: "Suspended",
  };

  const badgeClass = map[status as keyof typeof map] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  const displayName = displayNames[status as keyof typeof displayNames] || status;
  const dotColor = status === "PendingApproval" ? "bg-amber-400" : status === "Approved" ? "bg-emerald-400" : status === "Suspended" ? "bg-red-400" : "bg-rose-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
      {displayName}
    </span>
  );
}
