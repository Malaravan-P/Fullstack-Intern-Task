import { useEffect, useRef, useState } from "react";
import api, { request } from "../lib/api";

export default function RequestCategoryModal({ onClose, onCreated }) {
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Autofocus + close on Escape.
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Reset inline error as the user types.
  function onChange(e) {
    setName(e.target.value);
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 40) {
      return setError("Category name must be 2–40 characters.");
    }
    setBusy(true);
    const res = await request(api.post("/templates/categories/suggest", { name: trimmed }));
    setBusy(false);
    if (res.ok) {
      onCreated?.(res.data.suggestion);
      return;
    }
    if (res.status === 409) {
      setError(res.message);
    } else {
      setError(res.message);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
              Request a category
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Tell us what you'd like to see next — you'll vote on requests to
              pick what gets built first.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Close request form"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="suggest-category"
            className="text-sm font-semibold text-stone-700 dark:text-stone-300"
          >
            Category name
          </label>
          <input
            id="suggest-category"
            ref={inputRef}
            type="text"
            value={name}
            onChange={onChange}
            maxLength={40}
            placeholder="e.g. SaaS tools, Mobile apps…"
            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
          />
          {error && (
            <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit request"}
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