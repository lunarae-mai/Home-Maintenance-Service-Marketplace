import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Home } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — Home Services" }] }),
});

type Mode = "login" | "signup";
type Role = "customer" | "provider";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("customer");
  const navigate = useNavigate();

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      if (mode === "login") {
        const res = await api.post("/Auth/login", {
          email: data.email,
          password: data.password,
        });
        if (res.data.success) {
          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("refreshToken", res.data.data.refreshToken);
          navigate({ to: res.data.data.role === "Provider" ? "/provider-dashboard" : "/" });
        }
      } else {
        const res = await api.post("/Auth/register", {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: role === "provider" ? "Provider" : "Customer",
        });
        if (res.data.success) {
          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("refreshToken", res.data.data.refreshToken);

          if (role === "provider" && data.bio) {
            // Also register provider details
            await api.post("/Providers/register", {
              bio: data.bio,
              experience: 1, // default
              services: [
                {
                  serviceId: parseInt(data.categoryId as string) || 1,
                  basePrice: 50.0,
                },
              ],
            });
          }
          navigate({ to: res.data.data.role === "Provider" ? "/provider-dashboard" : "/" });
        }
      }
    } catch (err) {
      console.error(err);
      alert("Authentication failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-center gap-2 py-8">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
          <Home className="h-4 w-4" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Home Maintenance Marketplace</h1>
      </header>

      <div className="mx-auto w-full max-w-md px-4 pb-16">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-primary/5">
          {/* Mode tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-background p-1">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md py-2 text-sm font-medium tracking-wide uppercase transition-all ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Role toggle */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Select Access Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["customer", "provider"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border py-3 text-sm font-medium capitalize transition ${
                    role === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${role === r ? "bg-primary" : "bg-border"}`}
                  />
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Name" name="name" type="text" placeholder="Jane Doe" required />
                <Field
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+1 555 000 1234"
                  required
                />
              </>
            )}
            <Field
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            {mode === "signup" && role === "provider" && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Primary Category
                  </label>
                  <select
                    name="categoryId"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="1">Plumbing</option>
                    <option value="2">Electrical</option>
                    <option value="3">Cleaning</option>
                    <option value="4">Painting</option>
                    <option value="5">General Repairs</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    placeholder="Describe your expertise and experience..."
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
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
            />
            {mode === "signup" && (
              <Field
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
              />
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-primary py-3 text-sm font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
            >
              AUTHENTICATE ACCESS →
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
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
}: {
  label: string;
  type: string;
  placeholder?: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary"
      />
    </div>
  );
}
