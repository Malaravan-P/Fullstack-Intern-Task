import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { request } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { pushRecent, removeRecent } from "../lib/recent";
import CollectionPickerModal from "./CollectionPickerModal";
import { FONT_OPTIONS, extractTheme, buildCustomHtml } from "../lib/customize";

function Stars({ value, size = "text-lg" }) {
  const full = Math.round(Number(value) || 0);
  return (
    <span className={`${size} text-amber-400 tracking-tight`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "" : "opacity-30"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function PreviewModal({ templateId, onClose, isFavorite, onFavoriteChange }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState("");
  const [myScore, setMyScore] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fav, setFav] = useState(!!isFavorite);
  const [previewReady, setPreviewReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Customization playground
  const [customizing, setCustomizing] = useState(false);
  const [theme, setTheme] = useState({ accent: "#4f46e5", accent2: "#8b5cf6" });
  const [fontId, setFontId] = useState("default");
  const [device, setDevice] = useState("desktop");

  // Load details + ratings when opened.
  useEffect(() => {
    let alive = true;
    setPreviewReady(false);
    (async () => {
      const [dRes, rRes] = await Promise.all([
        request(api.get(`/templates/${templateId}`)),
        request(api.get(`/ratings/${templateId}`)),
      ]);
      if (!alive) return;
      if (dRes.ok) {
        setTemplate(dRes.data.template);
        setTheme(extractTheme(dRes.data.template.preview_html));
        setCustomizing(false);
        setFontId("default");
        setDevice("desktop");
        pushRecent(dRes.data.template); // feature: recently viewed
      } else {
        setError(dRes.message);
        if (dRes.status === 404) removeRecent(Number(templateId));
      }
      if (rRes.ok) setMyScore(rRes.data.my_score);
    })();
    return () => {
      alive = false;
    };
  }, [templateId]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function toggleFavorite() {
    if (busy) return;
    if (!token) return toast("Sign in to save favorites.", "info");
    setBusy(true);
    if (!fav) {
      const res = await request(api.post(`/favorites/${templateId}`, {}));
      if (res.ok || res.status === 409) {
        setFav(true);
        onFavoriteChange?.(Number(templateId), true);
        toast("Added to favorites", "success");
      } else toast(res.message, "error");
    } else {
      const res = await request(api.delete(`/favorites/${templateId}`));
      if (res.ok) {
        setFav(false);
        onFavoriteChange?.(Number(templateId), false);
        toast("Removed from favorites", "warning");
      } else toast(res.message, "error");
    }
    setBusy(false);
  }

  async function rate(score) {
    if (!token) return toast("Sign in to rate templates.", "info");
    const res = await request(api.post(`/ratings/${templateId}`, { score }));
    if (res.ok) {
      setMyScore(score);
      setTemplate((t) =>
        t && { ...t, avg_rating: res.data.avg_rating, rating_count: res.data.rating_count }
      );
      toast(score === 1 ? "Thanks for rating!" : `Rated ${score} ★`, "success");
    } else toast(res.message, "error");
  }

  const fontStack = FONT_OPTIONS.find((f) => f.id === fontId)?.stack || null;
  const displayHtml =
    template && customizing && template.preview_html
      ? buildCustomHtml(template.preview_html, {
          accent: theme.accent,
          accent2: theme.accent2,
          fontStack,
        })
      : template?.preview_html;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-white/10 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <div className="p-8 text-center text-sm font-medium text-red-600">{error}</div>
        ) : !template ? (
          <div className="animate-pulse p-6">
            <div className="h-56 rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="mt-4 h-5 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
            <div className="mt-2 h-4 w-full rounded bg-stone-100 dark:bg-stone-800" />
          </div>
        ) : (
          <>
            {/* Browser-style frame: renders the template's own HTML so the
                preview shows how it will actually look. */}
            <div className="border-b border-stone-200 dark:border-white/10">
              <div className="flex items-center gap-2 bg-stone-100 px-4 py-2.5 dark:bg-stone-800">
                <span className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </span>
                <span className="ml-2 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs font-medium text-stone-400 dark:bg-stone-900 dark:text-stone-500">
                  {template.name} — live preview
                </span>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full font-bold text-stone-500 transition hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>

              {template.preview_html ? (
                <div
                  className={`relative bg-stone-50 dark:bg-stone-950 ${
                    device === "mobile" ? "flex justify-center py-4" : ""
                  }`}
                >
                  <div
                    className={
                      device === "mobile"
                        ? "relative h-72 w-[320px] overflow-hidden rounded-3xl border-4 border-stone-800 bg-white shadow-xl sm:h-96"
                        : "relative h-72 w-full bg-white sm:h-80"
                    }
                  >
                    {!previewReady && (
                      <div className="absolute inset-0 z-10 animate-pulse bg-stone-100 dark:bg-stone-800" />
                    )}
                    <iframe
                      title={`${template.name} preview`}
                      srcDoc={displayHtml}
                      sandbox=""
                      className="h-full w-full"
                      onLoad={() => setPreviewReady(true)}
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="h-64 w-full object-cover"
                />
              )}

              {customizing && template.preview_html && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-stone-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-stone-900">
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Primary
                    <input
                      type="color"
                      value={theme.accent}
                      onChange={(e) => setTheme((t) => ({ ...t, accent: e.target.value }))}
                      className="h-7 w-9 cursor-pointer rounded border border-stone-300 bg-transparent dark:border-white/15"
                      aria-label="Primary color"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Secondary
                    <input
                      type="color"
                      value={theme.accent2}
                      onChange={(e) => setTheme((t) => ({ ...t, accent2: e.target.value }))}
                      className="h-7 w-9 cursor-pointer rounded border border-stone-300 bg-transparent dark:border-white/15"
                      aria-label="Secondary color"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Font
                    <select
                      value={fontId}
                      onChange={(e) => setFontId(e.target.value)}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-medium dark:border-white/15 dark:bg-stone-900 dark:text-stone-100"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-stone-300 p-0.5 dark:border-white/15">
                    {[
                      { id: "desktop", label: "Desktop" },
                      { id: "mobile", label: "Mobile" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDevice(d.id)}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                          device === d.id
                            ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                            : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setTheme(extractTheme(template.preview_html));
                      setFontId("default");
                    }}
                    className="ml-auto text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
                  >
                    ↺ Reset
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {template.category}
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {template.name}
                  </h2>
                </div>
                <div className="text-right">
                  <Stars value={template.avg_rating} />
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {template.avg_rating} · {template.rating_count}{" "}
                    {template.rating_count === 1 ? "rating" : "ratings"}
                  </p>
                </div>
              </div>

              <p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-300">
                {template.description}
              </p>

              {token && (
                <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-stone-800/60">
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                    Rate this template
                  </p>
                  <div className="mt-2 flex gap-1 text-2xl">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onClick={() => rate(i)}
                        className={`transition hover:scale-110 ${
                          myScore && i <= myScore
                            ? "text-amber-400"
                            : "text-stone-300 dark:text-stone-600"
                        }`}
                        aria-label={`Rate ${i}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={toggleFavorite}
                  disabled={busy}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                    fav
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300"
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
                  }`}
                >
                  {fav ? "★ Favorited" : "☆ Add to favorites"}
                </button>
                {token && (
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
                  >
                    📁 Add to collection
                  </button>
                )}
                {!token && (
                  <Link
                    to="/login"
                    className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
                  >
                    Sign in to save
                  </Link>
                )}
                {template.preview_html && (
                  <button
                    onClick={() => setCustomizing((c) => !c)}
                    className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                      customizing
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
                    }`}
                  >
                    🎨 {customizing ? "Customizing" : "Customize"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {pickerOpen && (
        <CollectionPickerModal
          templateId={Number(templateId)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
