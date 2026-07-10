import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sun, Moon, Palette, User, X, Lock, Mail, Phone, LogOut, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const links = [
  { to: "/" as const, label: "Home" },
  { to: "/services" as const, label: "Services" },
  { to: "/admin/login" as const, label: "Admin" },
];

export function TopNav() {
  const { theme, toggle, palette, setPalette } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  // Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "password">("profile");

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Customer Profile on Modal Open
  useEffect(() => {
    if (!showProfileModal) return;
    setMessage({ type: "", text: "" });
    const fetchProfile = async () => {
      try {
        const res = await api.get("/User/me");
        if (res.data.success) {
          const u = res.data.data;
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
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
    setShowProfileModal(false);
    window.location.href = "/";
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
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 border border-slate-200/50 dark:border-slate-800/50">
              <button
                onClick={() => {
                  setActiveSubTab("profile");
                  setMessage({ type: "", text: "" });
                }}
                className={`rounded-lg py-2 text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeSubTab === "profile"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => {
                  setActiveSubTab("password");
                  setMessage({ type: "", text: "" });
                }}
                className={`rounded-lg py-2 text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  activeSubTab === "password"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Security & Password
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
