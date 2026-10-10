import { useEffect, useRef, useState } from "react";
import api, { request } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function FeedbackModal({ onClose }) {
  const { toast } = useToast();
  const textareaRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Autofocus + close on Escape.
  useEffect(() => {
    textareaRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (!form.message.trim()) {
      return setErrors({ message: "Tell us what's on your mind." });
    }
    setBusy(true);
    const res = await request(api.post("/feedback", form));
    setBusy(false);
    if (res.ok) {
      toast("Thanks! We read every message.", "success");
      onClose();
      return;
    }
    if (res.status === 400) {
      setErrors(res.errors || {});
    } else {
      toast(res.message, "error");
    }
  }

  const labelClass = "text-sm font-semibold text-stone-700 dark:text-stone-300";
  const inputClass =
    "mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500";
  const errorClass = "mt-1 text-xs font-medium text-red-600 dark:text-red-400";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
              Feedback
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              If something's not right, or you'd love a new feature — click here
              and tell us.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Close feedback form"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="feedback-name" className={labelClass}>
                Name <span className="text-stone-400 dark:text-stone-500">(optional)</span>
              </label>
              <input
                id="feedback-name"
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Jane Doe"
                className={inputClass}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="feedback-email" className={labelClass}>
                Email <span className="text-stone-400 dark:text-stone-500">(optional)</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="feedback-message" className={labelClass}>
              Message
            </label>
            <textarea
              id="feedback-message"
              ref={textareaRef}
              rows={4}
              required
              maxLength={1000}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="A bug, an idea, or a request — we'd love to hear it…"
              className={`${inputClass} resize-none`}
            />
            {errors.message && <p className={errorClass}>{errors.message}</p>}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send feedback"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}