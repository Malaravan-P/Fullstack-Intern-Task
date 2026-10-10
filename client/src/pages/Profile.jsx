import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { request } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BackButton from "../components/BackButton";
import PreviewModal from "../components/PreviewModal";
import { getRecent, clearRecent } from "../lib/recent";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "reviews", label: "Reviews" },
  { id: "submissions", label: "Submissions" },
  { id: "settings", label: "Settings" },
];

function StatusChip({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
    approved: "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    rejected: "bg-red-100 text-red-800 ring-red-300 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}

function Stars({ score }) {
  return (
    <span className="text-base tracking-tight text-amber-400" aria-label={`${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= score ? "" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-stone-800 dark:text-stone-100">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">
          {description}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${
          checked ? "bg-indigo-600" : "bg-stone-300 dark:bg-stone-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function Profile() {
  const { logout, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const [ratings, setRatings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [recent, setRecent] = useState([]);
  const [previewId, setPreviewId] = useState(null);

  // rename
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    (async () => {
      const [meRes, ratingsRes, subsRes, collRes, prefsRes] = await Promise.all([
        request(api.get("/auth/me")),
        request(api.get("/me/ratings")),
        request(api.get("/submissions")),
        request(api.get("/collections")),
        request(api.get("/notifications/preferences")),
      ]);
      if (meRes.ok) setMe(meRes.data.user);
      else setError(meRes.message);
      if (ratingsRes.ok) setRatings(ratingsRes.data.ratings);
      if (subsRes.ok) setSubmissions(subsRes.data.submissions);
      if (collRes.ok) setCollections(collRes.data.collections);
      if (prefsRes.ok) {
        setPrefs({
          welcome: !!prefsRes.data.prefs.welcome,
          template_approval: !!prefsRes.data.prefs.template_approval,
        });
      }
      setRecent(getRecent());
      setLoading(false);
    })();
  }, []);

  function handleLogout() {
    logout();
    toast("Logged out — see you soon!", "success");
    navigate("/");
  }

  function clearRecentHistory() {
    clearRecent();
    setRecent([]);
  }

  function startRename() {
    setNameDraft(me?.name || "");
    setNameError("");
    setEditingName(true);
  }

  async function saveName(e) {
    e.preventDefault();
    const name = nameDraft.trim();
    if (name.length < 2 || name.length > 80) {
      return setNameError("Name must be 2–80 characters.");
    }
    setSavingName(true);
    const res = await request(api.patch("/auth/me", { name }));
    setSavingName(false);
    if (res.ok) {
      setMe((prev) => prev && { ...prev, name: res.data.user.name });
      updateUser(res.data.user);
      setEditingName(false);
      setNameError("");
      toast("Name updated!", "success");
    } else {
      setNameError(res.message);
    }
  }

  async function savePref(key, value) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSavingPrefs(true);
    const res = await request(api.put("/notifications/preferences", next));
    setSavingPrefs(false);
    if (res.ok) {
      toast("Preferences saved.", "success");
    } else {
      setPrefs(prefs); // revert
      toast(res.message, "error");
    }
  }

  const stats = [
    { label: "Favorites", value: me?.favorites_count ?? "—" },
    { label: "Collections", value: loading ? "—" : collections.length },
    { label: "Reviews", value: loading ? "—" : ratings.length },
    {
      label: "Member since",
      value: me?.created_at
        ? new Date(me.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—",
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-14 sm:px-6">
      <section className="mb-10 flex items-center justify-between gap-4">
        <div>
          <span className="rule" />
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Your profile
          </h1>
        </div>
        <BackButton inRow />
      </section>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-stone-900">
        {loading ? (
          <div className="animate-pulse space-y-4 p-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="mx-auto h-5 w-40 rounded bg-stone-200 dark:bg-stone-800" />
            <div className="mx-auto h-4 w-56 rounded bg-stone-100 dark:bg-stone-800" />
          </div>
        ) : error ? (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : me ? (
          <>
            {/* Identity header */}
            <div className="flex flex-col items-center px-8 pt-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-3xl font-bold text-white shadow-lg shadow-indigo-600/25">
                {me.name.charAt(0).toUpperCase()}
              </div>

              <div className="mt-4 flex flex-col items-center">
                {editingName ? (
                  <form onSubmit={saveName} className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameDraft}
                        onChange={(e) => {
                          setNameDraft(e.target.value);
                          if (nameError) setNameError("");
                        }}
                        maxLength={80}
                        autoFocus
                        className="w-52 rounded-xl border border-stone-300 bg-white px-4 py-2 text-lg font-bold text-stone-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100"
                        aria-label="New name"
                      />
                      <button
                        type="submit"
                        disabled={savingName}
                        className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {savingName ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingName(false)}
                        className="rounded-lg border border-stone-300 px-3.5 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-300 dark:hover:bg-stone-800"
                      >
                        Cancel
                      </button>
                    </div>
                    {nameError && (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        {nameError}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {me.name}
                    </h2>
                    <button
                      onClick={startRename}
                      aria-label="Rename"
                      title="Rename"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-indigo-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-indigo-300"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-stone-500 dark:text-stone-400">{me.email}</p>
                {me.role === "admin" && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 px-8 pt-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-stone-100 bg-stone-50 p-3 text-center dark:border-white/5 dark:bg-stone-800/60"
                >
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-8 flex gap-1 overflow-x-auto border-b border-stone-200 px-8 dark:border-white/10">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                    tab === t.id
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Overview */}
              {tab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                        Recently viewed
                      </h3>
                      {recent.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Link
                            to="/templates"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                          >
                            Browse more →
                          </Link>
                          <span className="text-stone-300 dark:text-stone-700">·</span>
                          <button
                            onClick={clearRecentHistory}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-stone-400 transition hover:bg-red-50 hover:text-red-600 dark:text-stone-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    {recent.length === 0 ? (
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Templates you preview will show up here.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {recent.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setPreviewId(t.id)}
                            className="group overflow-hidden rounded-xl border border-stone-200 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
                          >
                            <img
                              src={t.thumbnail_url}
                              alt={t.name}
                              className="h-20 w-full object-cover"
                            />
                            <span className="block truncate px-2.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200">
                              {t.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Collections
                    </h3>
                    {collections.length === 0 ? (
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Create folders to group templates you love.{" "}
                        <Link
                          to="/collections"
                          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                          Get started →
                        </Link>
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {collections.slice(0, 6).map((c) => (
                          <Link
                            key={c.id}
                            to="/collections"
                            className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                          >
                            {c.name} · {c.template_count}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link
                      to="/favorites"
                      className="flex h-11 min-w-[8.5rem] items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
                    >
                      My favorites
                    </Link>
                    <Link
                      to="/submit"
                      className="flex h-11 min-w-[8.5rem] items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      Submit a template
                    </Link>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {tab === "reviews" && (
                <div>
                  {ratings.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      You haven&apos;t reviewed any templates yet. Open a
                      template and give it a star rating.
                    </p>
                  ) : (
                    <ul className="divide-y divide-stone-100 dark:divide-white/5">
                      {ratings.map((r) => (
                        <li key={r.rating_id} className="flex items-center gap-4 py-3">
                          <img
                            src={r.thumbnail_url}
                            alt={r.name}
                            className="h-12 w-16 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-stone-800 dark:text-stone-100">
                              {r.name}
                            </p>
                            <p className="text-xs text-stone-400 dark:text-stone-500">
                              {r.category}
                            </p>
                          </div>
                          <Stars score={r.score} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Submissions */}
              {tab === "submissions" && (
                <div>
                  {submissions.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      No submissions yet.{" "}
                      <Link
                        to="/submit"
                        className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        Submit your first template →
                      </Link>
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {submissions.map((s) => (
                        <li
                          key={s.id}
                          className="rounded-xl border border-stone-200 p-4 dark:border-white/10"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-800 dark:text-stone-100">
                                {s.name}
                              </p>
                              <p className="text-xs text-stone-400 dark:text-stone-500">
                                {s.category}
                              </p>
                            </div>
                            <StatusChip status={s.status} />
                          </div>
                          {s.status === "rejected" && s.rejection_reason && (
                            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                              Reason: {s.rejection_reason}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Settings */}
              {tab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Account
                    </h3>
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-stone-200 p-4 dark:border-white/10">
                      <div>
                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                          {me.name}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{me.email}</p>
                      </div>
                      <button
                        onClick={startRename}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
                      >
                        Edit name
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Notifications
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Choose which updates you want to receive in-app.
                    </p>
                    <div className="mt-2 divide-y divide-stone-100 rounded-xl border border-stone-200 px-4 dark:divide-white/5 dark:border-white/10">
                      <Toggle
                        label="Welcome message"
                        description="A friendly hello when you create your account."
                        checked={!!prefs?.welcome}
                        disabled={savingPrefs}
                        onChange={(v) => savePref("welcome", v)}
                      />
                      <Toggle
                        label="Submission approvals"
                        description="Let me know when one of my templates is approved."
                        checked={!!prefs?.template_approval}
                        disabled={savingPrefs}
                        onChange={(v) => savePref("template_approval", v)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex h-11 min-w-[8.5rem] items-center justify-center rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {previewId && (
        <PreviewModal templateId={previewId} onClose={() => setPreviewId(null)} />
      )}
    </main>
  );
}