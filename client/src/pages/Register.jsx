import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { request } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BackButton from "../components/BackButton";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const from = location.state?.from?.pathname || "/templates";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setErrors({});
    setBusy(true);

    const res = await request(api.post("/auth/register", form));
    setBusy(false);

    if (!res.ok) {
      setErrors(res.errors || {});
      setError(res.message);
      return;
    }
    login(res.data.token, res.data.user);
    toast(`Welcome to TemplateStore, ${res.data.user.name}!`, "success");
    navigate(from, { replace: true }); // return to where they came from
  }

  const inputBase =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500";

  const inputClass = `${inputBase} mt-1.5`;
  const passwordClass = `${inputBase} pr-11`;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-9 shadow-xl shadow-stone-200/60 dark:border-white/10 dark:bg-stone-900 dark:shadow-none">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl font-bold text-white shadow-md shadow-emerald-600/25">
            T
          </div>
          <BackButton inRow />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Start collecting your favorite templates.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {[
            { key: "name", label: "Name", type: "text", placeholder: "Jane Doe" },
            { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { key: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
          ].map((f) => {
            const isPassword = f.type === "password";
            return (
              <div key={f.key}>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">{f.label}</label>
                {isPassword ? (
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={form[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={passwordClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-300"
                    >
                      {showPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <input
                    type={f.type}
                    required
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={inputClass}
                  />
                )}
                {errors[f.key] && (
                  <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors[f.key]}</p>
                )}
              </div>
            );
          })}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-600 disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: location.state?.from }}
            className="font-bold text-emerald-700 hover:underline dark:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
