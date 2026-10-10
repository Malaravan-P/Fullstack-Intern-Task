import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { request } from "../lib/api";
import BackButton from "../components/BackButton";
import { useToast } from "../context/ToastContext";

const fieldClass =
  "mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500";
const labelClass =
  "block text-sm font-semibold text-stone-700 dark:text-stone-200";

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

export default function SubmitTemplate() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    thumbnail_url: "",
    preview_html: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await request(api.get("/templates/categories"));
      if (res.ok) setCategories(res.data.categories);
    })();
  }, []);

  function set(name) {
    return (e) => {
      setForm((f) => ({ ...f, [name]: e.target.value }));
      setErrors((er) => ({ ...er, [name]: undefined }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await request(api.post("/submissions", form));
    setBusy(false);
    if (res.ok) {
      setSubmitted(res.data.submission);
      toast("Submission received — pending review.", "success");
    } else {
      setErrors(res.errors || {});
      if (res.message) toast(res.message, "error");
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-14 sm:px-6">
        <section className="mb-10">
          <span className="rule" />
          <div className="mt-3 flex items-center justify-between gap-4">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              Thanks, {submitted.name} 🚀
            </h1>
            <BackButton inRow />
          </div>
          <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
            Your template is in the review queue. An admin will publish or
            reject it shortly.
          </p>
        </section>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-stone-900">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-stone-900 dark:text-stone-100">
                {submitted.name}
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                {submitted.category}
              </p>
            </div>
            <StatusChip status={submitted.status} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/profile"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-600"
            >
              View in my profile →
            </Link>
            <button
              onClick={() => {
                setSubmitted(null);
                setForm({
                  name: "",
                  description: "",
                  category: form.category,
                  thumbnail_url: "",
                  preview_html: "",
                });
              }}
              className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Submit another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-14 sm:px-6">
      <section className="mb-10">
        <span className="rule" />
        <div className="mt-3 flex items-center justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Submit a template
          </h1>
          <BackButton inRow />
        </div>
        <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
          Publish your own template on the marketplace — an admin reviews every
          submission before it goes live.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-stone-900"
      >
        <div>
          <label className={labelClass} htmlFor="name">
            Title
          </label>
          <input
            id="name"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. SaaS Landing Pro"
            className={fieldClass}
            maxLength={80}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="What makes this template great?"
            className={fieldClass}
          />
          {errors.description && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.description}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            value={form.category}
            onChange={set("category")}
            list="category-options"
            placeholder="e.g. Landing Page"
            className={fieldClass}
            maxLength={40}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            Pick an existing category or suggest a new one — it will be added
            once approved.
          </p>
          {errors.category && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.category}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_120px]">
          <div>
            <label className={labelClass} htmlFor="thumbnail_url">
              Thumbnail image URL
            </label>
            <input
              id="thumbnail_url"
              value={form.thumbnail_url}
              onChange={set("thumbnail_url")}
              placeholder="https://…/preview.png"
              className={fieldClass}
            />
            {errors.thumbnail_url && (
              <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.thumbnail_url}
              </p>
            )}
          </div>
          <div className="sm:pt-5">
            <div className="h-24 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-white/10 dark:bg-stone-800">
              {form.thumbnail_url ? (
                <img
                  src={form.thumbnail_url}
                  alt="Thumbnail preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.opacity = 0.3;
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = 1;
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] font-medium uppercase tracking-wider text-stone-400">
                  Preview
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="preview_html">
            Template HTML
          </label>
          <textarea
            id="preview_html"
            value={form.preview_html}
            onChange={set("preview_html")}
            rows={16}
            spellCheck={false}
            placeholder={`<!doctype html>\n<html lang="en">\n<head>…</head>\n<body>…</body>\n</html>`}
            className={`${fieldClass} font-mono text-xs leading-relaxed`}
          />
          {errors.preview_html && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.preview_html}
            </p>
          )}
        </div>

        {form.preview_html && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Draft preview
            </p>
            <iframe
              title="Draft preview"
              srcDoc={form.preview_html}
              sandbox=""
              className="h-64 w-full rounded-xl border border-stone-200 bg-white dark:border-white/10"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Stay tuned — we notify you as soon as it&apos;s approved.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-600 disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      </form>
    </main>
  );
}