import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { request } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BackButton from "../components/BackButton";

const FILTERS = ["pending", "rejected", "approved"];

function StatusChip({ status }) {
  const styles = {
    pending: "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    approved: "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    rejected: "bg-red-100 text-red-800 ring-red-300 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}

function fmtDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminReviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState(null);
  const [copy, setCopy] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    (async () => {
      const res = await request(api.get("/admin/submissions"));
      if (res.ok) setSubmissions(res.data.submissions);
      else toast(res.message, "error");
      setLoading(false);
    })();
  }, [user, toast]);

  async function loadPreview(id) {
    const res = await request(api.get(`/admin/submissions/${id}`));
    if (res.ok) setCopy(res.data.submission.preview_html);
  }

  function toggleExpand(s) {
    if (expandedId === s.id) {
      setExpandedId(null);
      setCopy(null);
      setRejectingId(null);
      return;
    }
    setExpandedId(s.id);
    setRejectingId(null);
    setReason("");
    setCopy(null);
    loadPreview(s.id);
  }

  async function decide(id, status) {
    if (busy) return;
    setBusy(true);
    const body =
      status === "rejected"
        ? { status, rejection_reason: reason.trim() || "Did not meet marketplace standards." }
        : { status };
    const res = await request(api.patch(`/admin/submissions/${id}`, body));
    setBusy(false);
    if (res.ok) {
      toast(
        status === "approved"
          ? "Approved — now live for everyone."
          : "Rejected — author was not notified (in-app).",
        status === "approved" ? "success" : "error"
      );
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      setExpandedId(null);
      setRejectingId(null);
      setCopy(null);
      setReason("");
    } else {
      toast(res.message, "error");
    }
  }

  if (user?.role !== "admin") {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-14 sm:px-6">
        <section className="mb-10">
          <span className="rule" />
          <div className="mt-3 flex items-center justify-between gap-4">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              Admins only
            </h1>
            <BackButton inRow />
          </div>
          <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
            This page is for store administrators reviewing submissions.
          </p>
        </section>

        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-white/15 dark:bg-stone-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-2xl dark:from-emerald-500/20 dark:to-teal-500/20">
            🔒
          </div>
          <Link
            to="/templates"
            className="mt-6 inline-block rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            Browse templates →
          </Link>
        </div>
      </main>
    );
  }

  const visible =
    filter === "pending"
      ? submissions.filter((s) => s.status === "pending")
      : submissions.filter((s) => s.status === filter);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-14 sm:px-6">
      <section className="mb-8">
        <span className="rule" />
        <div className="mt-3 flex items-center justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Review submissions
          </h1>
          <BackButton inRow />
        </div>
        <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
          Approve great templates, reject the rest — authors are notified when
          theirs go live.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = submissions.filter((s) => s.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ring-1 ${
                filter === f
                  ? "bg-emerald-500 text-white ring-emerald-600"
                  : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-white/15 dark:hover:bg-stone-800"
              }`}
            >
              {f} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-white/15 dark:bg-stone-900">
          <p className="font-semibold text-stone-700 dark:text-stone-200">
            Nothing here {filter !== "pending" ? `(${filter})` : "— queue is clear"} 🎉
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            New developer submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-stone-900"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                  {s.thumbnail_url ? (
                    <img
                      src={s.thumbnail_url}
                      alt={s.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">
                      {s.name}
                    </h3>
                    <StatusChip status={s.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    {s.category} · by {s.author_name || "Unknown"} ·{" "}
                    {fmtDate(s.created_at)}
                  </p>
                  {s.status === "rejected" && s.rejection_reason && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Reason: {s.rejection_reason}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.status === "pending" && (
                    <>
                      <button
                        onClick={() => decide(s.id, "approved")}
                        disabled={busy}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(rejectingId === s.id ? null : s.id);
                          setReason("");
                        }}
                        disabled={busy}
                        className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        Reject
                      </button>
                      {rejectingId === s.id && (
                        <button
                          onClick={() => decide(s.id, "rejected")}
                          disabled={busy || !reason.trim()}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                        >
                          {busy ? "…" : "Confirm"}
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => toggleExpand(s)}
                    className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
                  >
                    {expandedId === s.id ? "Close preview" : "Review"}
                  </button>
                </div>
              </div>

              {rejectingId === s.id && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                    Rejection reason (optional)
                  </label>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why was it rejected? (shown to the author)"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm dark:border-white/15 dark:bg-stone-900 dark:text-stone-100"
                  />
                </div>
              )}

              {expandedId === s.id && (
                <div className="mt-4">
                  <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-white/10 dark:bg-stone-800">
                    {copy ? (
                      <iframe
                        title={`${s.name} preview`}
                        srcDoc={copy}
                        sandbox=""
                        className="h-80 w-full bg-white"
                      />
                    ) : (
                      <div className="flex h-80 items-center justify-center animate-pulse text-sm text-stone-400">
                        Loading preview…
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}