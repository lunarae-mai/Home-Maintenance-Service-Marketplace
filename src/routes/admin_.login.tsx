import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopNav } from "@/components/top-nav";
import { useState } from "react";
import api from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin_/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real scenario this might be a specialized admin endpoint
      // Using standard login with role check
      const res = await api.post("/Auth/login", { email, password });
      if (res.data.success && res.data.data.role === "Admin") {
        localStorage.setItem("accessToken", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
        navigate({ to: "/admin" });
      } else {
        alert("Access Denied: You do not have administrator privileges.");
      }
    } catch (err) {
      console.error(err);
      alert("Authentication failed. Check your credentials.");
      
      // Fallback for simulation purposes if backend is down
      if (email === "admin@example.com" && password === "admin") {
         navigate({ to: "/admin" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <TopNav />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Gateway</h1>
            <p className="mt-2 text-sm text-muted-foreground">Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
