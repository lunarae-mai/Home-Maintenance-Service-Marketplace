import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { z } from "zod";

const authSearchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
  role: z.enum(["customer", "provider"]).optional(),
});

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: authSearchSchema,
  head: () => ({ meta: [{ title: "Sign in — Home Services" }] }),
});

type Mode = "login" | "signup";
type Role = "customer" | "provider";

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode || "login");
  const [role, setRole] = useState<Role>(search.role || "customer");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Controlled states for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [categoryId, setCategoryId] = useState("1");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setConfirmPassword("");
    setBio("");
    setCategoryId("1");
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setAuthError(null);
    resetForm();
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setAuthError(null);
    resetForm();
  };

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    // Clear any old tokens before starting a new signup/registration request
    if (mode === "signup") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    try {
      if (mode === "login") {
        const res = await api.post("/Auth/login", {
          email,
          password,
        });
        if (res.data.success) {
          const returnedRole: string = (res.data.data.role || "").toLowerCase();
          const isAdmin = returnedRole === "admin";

          // Role-based access guard — admins bypass all checks
          if (!isAdmin) {
            if (role === "customer" && returnedRole !== "customer") {
              setAuthError(
                `This account is registered as a ${returnedRole}. Please use the ${returnedRole.charAt(0).toUpperCase() + returnedRole.slice(1)} portal to log in.`
              );
              setIsLoading(false);
              return;
            }
            if (role === "provider" && returnedRole !== "provider") {
              setAuthError(
                `This account is registered as a ${returnedRole}. Please switch to the ${returnedRole.charAt(0).toUpperCase() + returnedRole.slice(1)} portal to log in.`
              );
              setIsLoading(false);
              return;
            }
          }

          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("refreshToken", res.data.data.refreshToken);

          if (isAdmin || returnedRole === "admin") {
            navigate({ to: "/admin" });
          } else if (returnedRole === "provider") {
            navigate({ to: "/provider-dashboard" });
          } else {
            const savedBooking = sessionStorage.getItem("savedBookingState");
            if (savedBooking) {
              try {
                const state = JSON.parse(savedBooking);
                navigate({
                  to: "/services/$serviceId/providers",
                  params: { serviceId: state.serviceId.toString() },
                });
                return;
              } catch (e) {
                console.error("Failed to parse saved booking state", e);
              }
            }
            navigate({ to: "/" });
          }
        }
      } else {
        if (role === "provider") {
          if (confirmPassword && password !== confirmPassword) {
            alert("Passwords do not match!");
            setIsLoading(false);
            return;
          }

          let token = "";
          let refreshToken = "";

          try {
            // 1. Create the user account with role "Provider"
            const res = await api.post("/Auth/register", {
              name,
              email,
              password,
              phone,
              role: "Provider",
            });
            if (res.data.success) {
              token = res.data.data.accessToken;
              refreshToken = res.data.data.refreshToken;
            }
          } catch (registerErr: any) {
            // Self-healing: if the user account already exists, try logging in
            const isUserExists =
              registerErr.response?.data?.details?.includes("User already exists") ||
              registerErr.response?.data?.message?.includes("User already exists") ||
              registerErr.message?.includes("User already exists");

            if (isUserExists) {
              console.log("User already exists. Attempting to log in to complete provider registration...");
              const loginRes = await api.post("/Auth/login", {
                email,
                password,
              });
              if (loginRes.data.success) {
                token = loginRes.data.data.accessToken;
                refreshToken = loginRes.data.data.refreshToken;
              }
            } else {
              throw registerErr;
            }
          }

          if (token) {
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);

            // 2. Register provider profile details using the newly acquired token
            await api.post("/Providers/register", {
              bio: bio || "",
              experience: 1, // default
              services: [
                {
                  serviceId: parseInt(categoryId) || 1,
                  basePrice: 50.0,
                },
              ],
            });
            navigate({ to: "/provider-dashboard" });
          }
        } else {
          // Customer Registration
          if (confirmPassword && password !== confirmPassword) {
            alert("Passwords do not match!");
            setIsLoading(false);
            return;
          }

          const res = await api.post("/Auth/register", {
            name,
            email,
            password,
            phone,
            role: "Customer",
          });
          if (res.data.success) {
            localStorage.setItem("accessToken", res.data.data.accessToken);
            localStorage.setItem("refreshToken", res.data.data.refreshToken);
            const savedBooking = sessionStorage.getItem("savedBookingState");
            if (savedBooking) {
              try {
                const state = JSON.parse(savedBooking);
                navigate({
                  to: "/services/$serviceId/providers",
                  params: { serviceId: state.serviceId.toString() },
                });
                return;
              } catch (e) {
                console.error("Failed to parse saved booking state", e);
              }
            }
            navigate({ to: "/" });
          }
        }
      }
    } catch (err: any) {
      console.error("Authentication Error Details:", err);
      let errorMsg = "Authentication failed. Please check your credentials.";
      
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMsg = err.response.data;
        } else if (err.response.data.details) {
          errorMsg = err.response.data.details;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors;
          if (Array.isArray(errors)) {
            errorMsg = errors.join("\n");
          } else if (typeof errors === "object") {
            errorMsg = Object.values(errors).flat().join("\n");
          }
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setAuthError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-violet-500/30 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      {/* Ambient background glow elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 dark:bg-cyan-600/5 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-center gap-2 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-500/5">
          <Home className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">Home Maintenance Marketplace</h1>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-xl">
          {/* Top gradient strip — violet to cyan matching platform theme */}
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 to-cyan-500" />
          
          <div className="p-6 sm:p-8">
            {/* Mode tabs */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 border border-slate-200/50 dark:border-slate-800/50">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`rounded-lg py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    mode === m
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {m === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Role selection toggle */}
            {!search.role && (
              <div className="mb-6">
                <label className="mb-2 block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Select Access Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["customer", "provider"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleChange(r)}
                      className={`rounded-xl border py-3 text-sm font-semibold capitalize transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        role === r
                          ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 shadow-md shadow-violet-500/5"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <span
                        className={`mr-2 inline-block h-2 w-2 rounded-full transition-all duration-300 ${
                          role === r ? "bg-violet-500 dark:bg-violet-400 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <Field
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Field
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+1 555 000 1234"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </>
              )}
              
              <Field
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {mode === "signup" && role === "provider" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Primary Category
                    </label>
                    <select
                      name="categoryId"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 focus:ring-violet-500"
                    >
                      <option value="1">Plumbing</option>
                      <option value="2">Electrical</option>
                      <option value="3">Cleaning</option>
                      <option value="4">Painting</option>
                      <option value="5">General Repairs</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={3}
                      placeholder="Describe your expertise and experience..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 focus:ring-violet-500 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              <Field
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {mode === "signup" && (
                <Field
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}

              {/* Inline auth error banner */}
              {authError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 h-3.5 w-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-black">!</span>
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-md shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-500/30 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer py-3.5 font-bold"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "login" ? "Sign In →" : "Create Account →"}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-850 dark:hover:text-slate-200 transition duration-200">
            ← Back to marketplace
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  name,
  required,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative flex items-center">
        <input
          name={name}
          type={inputType}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 px-4 py-3 pr-12 text-sm outline-none transition-all duration-300"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none z-20 p-1 rounded-md"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
