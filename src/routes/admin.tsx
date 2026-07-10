import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, ShieldCheck, Activity, Home, DollarSign, Calendar, Zap, User as UserIcon, LogOut, CheckCircle2, ChevronRight } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Console — Home Services" }] }),
});

type Pending = { id: string; name: string; category: string; status: "REVIEW" | "APPROVED" | "REJECTED"; initials: string };

const INITIAL: Pending[] = [
  { id: "p1", name: "Alexander Vaughn", category: "Painting", status: "REVIEW", initials: "AV" },
  { id: "p2", name: "Flowline Plumbing", category: "Plumbing", status: "REVIEW", initials: "FP" },
  { id: "p3", name: "Voltaic Electrical", category: "Electrical", status: "REVIEW", initials: "VE" },
  { id: "p4", name: "Sparkline Cleaners", category: "Cleaning", status: "REVIEW", initials: "SC" },
  { id: "p5", name: "HandyPro Fixers", category: "General Repairs", status: "REVIEW", initials: "HP" },
];

const NAV = [
  { label: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { label: "Profile", id: "profile", icon: UserIcon },
  { label: "Providers", id: "providers", icon: Users },
  { label: "Verification", id: "verification", icon: ShieldCheck },
  { label: "System", id: "system", icon: Activity },
];

const METRICS = [
  { label: "Transaction Volume", value: "$248,120", sub: "+12.4% MoM", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Customer Base", value: "8,412", sub: "+321 this week", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Total Bookings", value: "3,127", sub: "94% completion", icon: Calendar, color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "System Latency", value: "184ms", sub: "p95 stable", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10" },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [rows, setRows] = useState(INITIAL);
  const [adminProfile, setAdminProfile] = useState<any>({
    name: "System Administrator",
    email: "admin@homeservices.com",
    role: "Super Admin",
    joinDate: "Jan 15, 2024",
    status: "Active"
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });
  const [selectedProvider, setSelectedProvider] = useState<Pending | null>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setAdminProfile((prev: any) => ({ ...prev, email: userEmail }));
    }
  }, []);

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
        success: "" 
      });
    }
  };
  const navigate = useNavigate();

  const handleProviderApproval = async (providerId: string, statusAction: "APPROVED" | "REJECTED") => {
    try {
      const action = statusAction === "APPROVED" ? "approve" : "reject";
      await api.put(`/Admin/providers/${providerId}/${action}`);
      setRows((prev) => prev.map((r) => (r.id === providerId ? { ...r, status: statusAction } : r)));
    } catch (err) {
      console.log("Simulating approval.", { providerId, statusAction });
      setRows((prev) => prev.map((r) => (r.id === providerId ? { ...r, status: statusAction } : r)));
    }
    setSelectedProvider(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail"); // Optional: clear user email too
    navigate({ to: "/" });
  };

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
              <n.icon className={`h-5 w-5 ${activeTab === n.id ? "text-cyan-400" : "opacity-70"}`} />
              {n.label}
              {activeTab === n.id && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </button>
          ))}
        </nav>
        
        <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition" onClick={() => setActiveTab("profile")}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shrink-0">
                 <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">AD</div>
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-white truncate w-full">{adminProfile.name}</p>
                 <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online</p>
              </div>
           </div>
           <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition border border-transparent hover:border-rose-500/30">
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
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Platform Overview</h1>
                <p className="mt-2 text-slate-400">Real-time metrics and operational status for the entire marketplace.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {METRICS.map((m, i) => (
                  <div key={m.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{m.label}</p>
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
                    <p className="text-sm text-slate-400">Applications awaiting security clearance.</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                    {rows.filter(r => r.status === 'REVIEW').length} Pending
                  </div>
                </div>
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
                        <tr key={r.id} onClick={() => setSelectedProvider(r)} className="transition-colors hover:bg-white/5 cursor-pointer group">
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
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-6 py-5 text-right">
                             <span className="text-xs font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">VIEW DETAILS →</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F13] shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="h-32 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 relative">
                     <button onClick={() => setSelectedProvider(null)} className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-md transition">✕</button>
                     <div className="absolute -bottom-10 left-8 h-20 w-20 rounded-2xl border-4 border-[#0F0F13] bg-gradient-to-tr from-slate-700 to-slate-900 p-0.5 shadow-xl">
                        <div className="h-full w-full rounded-xl bg-black flex items-center justify-center text-2xl font-black text-white">{selectedProvider.initials}</div>
                     </div>
                  </div>
                  <div className="px-8 pt-14 pb-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h2 className="text-2xl font-bold text-white">{selectedProvider.name}</h2>
                           <p className="text-cyan-400 font-medium">{selectedProvider.category} Professional</p>
                        </div>
                        <StatusBadge status={selectedProvider.status} />
                     </div>
                     
                     <div className="space-y-4 mb-8">
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                           <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Email Address</p>
                           <p className="text-sm font-medium text-slate-200">{selectedProvider.name.toLowerCase().replace(' ', '.')}@example.com</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                           <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Experience</p>
                           <p className="text-sm font-medium text-slate-200">5+ Years in {selectedProvider.category}</p>
                        </div>
                     </div>

                     <div className="flex gap-3">
                        <button
                           disabled={selectedProvider.status !== "REVIEW"}
                           onClick={() => handleProviderApproval(selectedProvider.id, "REJECTED")}
                           className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm font-bold text-rose-400 transition hover:bg-rose-500 hover:text-white disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-400"
                        >
                           Reject Application
                        </button>
                        <button
                           disabled={selectedProvider.status !== "REVIEW"}
                           onClick={() => handleProviderApproval(selectedProvider.id, "APPROVED")}
                           className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500"
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
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Administrator Profile</h1>
                <p className="mt-2 text-slate-400">Manage your credentials and security settings.</p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
                 <div className="h-32 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 relative">
                    <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-2xl border-4 border-[#0F0F13] bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shadow-xl">
                       <div className="h-full w-full rounded-xl bg-black flex items-center justify-center text-3xl font-black text-white">AD</div>
                    </div>
                 </div>
                 
                 <div className="px-8 pt-16 pb-8">
                    <div className="flex justify-between items-start mb-8">
                       <div>
                          <h2 className="text-2xl font-bold text-white">{adminProfile.name}</h2>
                          <p className="text-cyan-400 font-medium">{adminProfile.role}</p>
                       </div>
                       <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400 border border-emerald-500/20">
                         <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                         System Online
                       </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Email Address</p>
                          <p className="text-slate-200 font-medium">{adminProfile.email}</p>
                       </div>
                       <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Access Level</p>
                          <p className="text-slate-200 font-medium flex items-center gap-2">
                             <ShieldCheck className="h-4 w-4 text-purple-400" />
                             Full Clearance
                          </p>
                       </div>
                       <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Member Since</p>
                          <p className="text-slate-200 font-medium">{adminProfile.joinDate}</p>
                       </div>
                       <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Last Login</p>
                          <p className="text-slate-200 font-medium">Just now</p>
                       </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                       <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
                       <div className="space-y-3">
                          {!showPasswordForm ? (
                            <button onClick={() => setShowPasswordForm(true)} className="w-full flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10 group">
                               <div>
                                  <p className="font-semibold text-slate-200 text-left">Change Password</p>
                                  <p className="text-sm text-slate-400">Update your account credentials regularly.</p>
                               </div>
                               <ChevronRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1" />
                            </button>
                          ) : (
                            <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                               <h4 className="mb-4 font-bold text-white">Update Password</h4>
                               {passwordStatus.error && <p className="mb-3 text-xs text-rose-400 bg-rose-500/10 p-2 rounded">{passwordStatus.error}</p>}
                               {passwordStatus.success && <p className="mb-3 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded">{passwordStatus.success}</p>}
                               <form onSubmit={handleChangePassword} className="space-y-3">
                                  <input type="password" placeholder="Current Password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" />
                                  <input type="password" placeholder="New Password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" />
                                  <input type="password" placeholder="Confirm New Password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" />
                                  <div className="flex justify-end gap-2 mt-4">
                                     <button type="button" onClick={() => setShowPasswordForm(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition">Cancel</button>
                                     <button type="submit" disabled={passwordStatus.loading} className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-600 transition disabled:opacity-50">Save changes</button>
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

          {activeTab !== "dashboard" && activeTab !== "profile" && (
            <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5">
               <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                  <p className="text-lg font-bold text-slate-400">Module Initializing...</p>
                  <p className="text-sm text-slate-500">The {activeTab} panel is currently under maintenance.</p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: "REVIEW" | "APPROVED" | "REJECTED" }) {
  const map = {
    REVIEW: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${map[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'REVIEW' ? 'bg-amber-400' : status === 'APPROVED' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
      {status === "REVIEW" ? "In Review" : status}
    </span>
  );
}
