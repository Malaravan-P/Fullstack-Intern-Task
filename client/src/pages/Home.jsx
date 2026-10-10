import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { request } from "../lib/api";
import TemplateCard from "../components/TemplateCard";
import PreviewModal from "../components/PreviewModal";
import { pushRecent } from "../lib/recent";

const features = [
  {
    icon: "⭐",
    title: "Save your favorites",
    text: "One tap to bookmark any template. Your personal collection lives in My Favorites.",
  },
  {
    icon: "🔍",
    title: "Browse every detail",
    text: "Each template card shows the full picture — image, category, and description.",
  },
  {
    icon: "⚡",
    title: "Fast & responsive",
    text: "A clean, modern interface that works beautifully on desktop and mobile.",
  },
];

const categoryStyles = [
  "from-indigo-600 to-violet-600",
  "from-emerald-600 to-teal-600",
  "from-rose-600 to-orange-500",
  "from-sky-600 to-cyan-500",
  "from-amber-500 to-yellow-600",
  "from-fuchsia-600 to-pink-600",
];

const faqs = [
  {
    q: "Is TemplateStore free to use?",
    a: "Yes — browsing, previewing, and rating templates is completely free. An account lets you build a personal favorites list in seconds.",
  },
  {
    q: "How do I preview a template?",
    a: "Click any template card and a live preview opens in a browser-style frame, so you can see exactly how the design will look before you save it.",
  },
  {
    q: "Can I preview on mobile?",
    a: "Absolutely. The preview and the whole store are fully responsive, so everything works on your phone or tablet too.",
  },
  {
    q: "How do I add a template to my favorites?",
    a: "Open the template card and hit the Favorite button (or the star in the preview window). Find everything you saved under My Favorites.",
  },
];

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [previewId, setPreviewId] = useState(null);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    api
      .get("/templates")
      .then((res) => {
        const all = res.data.templates || [];
        const featured = [];
        const seen = new Set();
        for (const t of all) {
          if (seen.has(t.category)) continue;
          seen.add(t.category);
          featured.push(t);
          if (featured.length === 3) break;
        }
        setTemplates(featured);
      })
      .catch(() => {});
  }, []);

  // Favorite state + category tiles (both needed for the cards/CTAs below).
  useEffect(() => {
    (async () => {
      const [fRes, cRes] = await Promise.all([
        request(api.get("/favorites")),
        request(api.get("/templates/categories")),
      ]);
      if (fRes.ok) setFavoriteIds(new Set(fRes.data.favorites.map((t) => t.id)));
      if (cRes.ok) setCategories(cRes.data.categories);
    })();
  }, []);

  function openPreview(t) {
    pushRecent(t);
    setPreviewId(t.id);
  }

  function handleFavoriteChange(id, isNowFavorite) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isNowFavorite) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ============ Hero ============ */}
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        <span className="animate-fade-up rounded-full border border-indigo-600/15 bg-indigo-600/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-700">
          ✦ Mini SaaS Template Store
        </span>
        <h1 className="mt-6 max-w-3xl animate-fade-up font-display text-4xl font-extrabold leading-tight tracking-tight text-stone-900 [animation-delay:80ms] sm:text-6xl dark:text-stone-50">
          Discover templates that{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-amber-500 bg-clip-text text-transparent">
            make websites beautiful
          </span>
        </h1>
        <p className="mt-5 max-w-xl animate-fade-up text-lg text-stone-500 [animation-delay:160ms] dark:text-stone-400">
          Browse a curated collection of ready-made designs, mark the ones you
          love, and find them all in one place.
        </p>
        <div className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
          <Link
            to="/templates"
            className="rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Browse templates →
          </Link>
          <Link
            to="/register"
            className="rounded-full border border-stone-300 bg-white px-7 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 dark:border-white/15 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Create free account
          </Link>
        </div>

        {/* decorative glow */}
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-200/60 via-violet-200/50 to-amber-200/60 blur-3xl" />
      </section>

      {/* ============ Features ============ */}
      <section className="grid gap-6 py-8 sm:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="animate-fade-up flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-stone-900"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-amber-100 text-2xl">
              {f.icon}
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {f.text}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ============ Featured templates ============ */}
      <section className="py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="rule" />
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Featured templates
            </h2>
            <p className="mt-2 text-stone-500 dark:text-stone-400">
              A taste of what's inside — scroll through the full collection.
            </p>
          </div>
          <Link
            to="/templates"
            className="link-draw pb-1 text-sm font-semibold text-indigo-700 dark:text-indigo-300"
          >
            View all templates →
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-44 rounded-2xl bg-stone-200 dark:bg-stone-800" />
                <div className="mt-4 h-4 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
                <div className="mt-2 h-3 w-full rounded bg-stone-100 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isFavorite={favoriteIds.has(t.id)}
                onFavoriteChange={handleFavoriteChange}
                onPreview={openPreview}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============ CTA ============ */}
      <section className="py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-800 px-8 py-14 text-center shadow-xl shadow-indigo-700/20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-3xl font-bold text-white">
            Ready to find your next favorite?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-indigo-100">
            Create an account in seconds and start building your collection.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-block rounded-full bg-white px-7 py-3 text-sm font-bold text-indigo-800 shadow transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            Get started — it's free
          </Link>
        </div>
      </section>

      {/* ============ Browse by category ============ */}
      {categories.length > 0 && (
        <section className="py-10">
          <div className="text-center">
            <span className="rule" />
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Browse by category
            </h2>
            <p className="mt-2 text-stone-500 dark:text-stone-400">
              Every collection, one click away.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((c, i) => (
              <Link
                key={c}
                to={`/templates?category=${encodeURIComponent(c)}`}
                className={`group flex items-center justify-between rounded-2xl bg-gradient-to-br ${categoryStyles[i % categoryStyles.length]} px-6 py-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <span className="text-sm font-bold text-white sm:text-base">{c}</span>
                <span className="text-lg text-white/70 transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ FAQ ============ */}
      <section className="py-10 pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="rule" />
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-stone-900"
                >
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300"
                  >
                    <span
                      className={`font-semibold transition-colors duration-300 ${
                        open
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-stone-900 dark:text-stone-100"
                      }`}
                    >
                      {f.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                        open
                          ? "rotate-180 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                          : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-300"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`px-5 pb-5 text-sm leading-relaxed text-stone-500 transition-all duration-300 ease-out dark:text-stone-400 ${
                          open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                        }`}
                      >
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- Modals ---- */}
      {previewId && (
        <PreviewModal
          templateId={previewId}
          onClose={() => setPreviewId(null)}
          isFavorite={favoriteIds.has(Number(previewId))}
          onFavoriteChange={handleFavoriteChange}
        />
      )}
    </main>
  );
}