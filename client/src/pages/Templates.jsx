import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { request } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import TemplateCard from "../components/TemplateCard";
import PreviewModal from "../components/PreviewModal";
import CompareModal from "../components/CompareModal";
import RequestCategoryModal from "../components/RequestCategoryModal";
import { getRecent, pushRecent, clearRecent } from "../lib/recent";

const PAGE_SIZE = 6;

export default function Templates() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // filters / sort
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState([]);

  // category requests
  const [suggestions, setSuggestions] = useState([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [votedIds, setVotedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("votedCategories")) || []);
    } catch {
      return new Set();
    }
  });

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Preselect a category when arriving via a link (e.g. homepage tiles).
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  useEffect(() => {
    if (urlCategory && urlCategory !== category) {
      changeFilter(() => setCategory(urlCategory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory]);

  // modals
  const [previewId, setPreviewId] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [recent, setRecent] = useState(getRecent);
  // Forces a refetch even when a filter is set to the same value
  // (otherwise clicking the active chip clears the grid forever).
  const [fetchKey, setFetchKey] = useState(0);

  // favorites + categories + suggestions (once)
  useEffect(() => {
    (async () => {
      const [fRes, cRes, sRes] = await Promise.all([
        request(api.get("/favorites")),
        request(api.get("/templates/categories")),
        request(api.get("/templates/categories/suggest")),
      ]);
      if (fRes.ok) setFavoriteIds(new Set(fRes.data.favorites.map((t) => t.id)));
      if (cRes.ok) setCategories(cRes.data.categories);
      if (sRes.ok) setSuggestions(sRes.data.suggestions);
    })();
  }, []);

  // Fetch templates whenever filters/sort/page change (debounced search).
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      if (page === 1) setLoading(true);

      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort });
      if (search.trim()) params.set("search", search.trim());
      if (category) params.set("category", category);

      const res = await request(api.get(`/templates?${params}`));
      if (!alive) return;

      if (res.ok) {
        setTemplates((prev) => (page === 1 ? res.data.templates : [...prev, ...res.data.templates]));
        setTotal(res.data.total);
        setError("");
      } else {
        setError(res.message);
      }
      setLoading(false);
      setLoadingMore(false);
    }, search.trim() ? 300 : 0); // debounce typing

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [search, category, sort, page, fetchKey]);

  function changeFilter(fn) {
    setPage(1);
    setTemplates([]);
    setLoading(true); // avoid an "empty results" flash while the new fetch runs
    setFetchKey((k) => k + 1); // guarantee one fetch, even if no dep actually changes
    fn();
  }

  function loadMore() {
    setLoadingMore(true);
    setPage((p) => p + 1);
  }

  function handleFavoriteChange(id, isNowFavorite) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isNowFavorite) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleCompare(t) {
    setCompareList((prev) => {
      if (prev.some((x) => x.id === t.id)) return prev.filter((x) => x.id !== t.id);
      if (prev.length >= 3) {
        toast("You can compare up to 3 templates.", "info");
        return prev;
      }
      return [...prev, t];
    });
  }

  function openPreview(t) {
    pushRecent(t); // record immediately so the strip updates right away
    setRecent(getRecent());
    setPreviewId(t.id);
  }

  function clearRecentHistory() {
    clearRecent();
    setRecent([]);
  }

  function handleRequestCreated(suggestion) {
    setSuggestions((prev) => [suggestion, ...prev]);
    setRequestOpen(false);
    toast("Category request submitted!", "success");
  }

  async function upvoteSuggestion(suggestion) {
    if (votedIds.has(suggestion.id)) return;
    const before = suggestion.votes;
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestion.id ? { ...s, votes: s.votes + 1 } : s))
    );
    const res = await request(api.post(`/templates/categories/suggest/${suggestion.id}/vote`));
    if (res.ok) {
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestion.id ? { ...s, votes: res.data.suggestion.votes } : s
        )
      );
      const next = new Set(votedIds);
      next.add(suggestion.id);
      setVotedIds(next);
      try {
        localStorage.setItem("votedCategories", JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      toast("Vote counted. Thanks!", "success");
    } else {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestion.id ? { ...s, votes: before } : s))
      );
      toast(res.message, "error");
    }
  }

  const shownCount = templates.length;
  const hasMore = shownCount < total;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <section className="mb-8 animate-fade-up">
        <span className="rule" />
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          All templates
        </h1>
        <p className="mt-3 max-w-xl text-lg text-stone-500 dark:text-stone-400">
          {user
            ? `Welcome back, ${user.name}. Tap Preview for details or star to save.`
            : "Browse the full collection — sign in to save your favorites."}
        </p>
      </section>

      {/* ---- Controls: search + sort ---- */}
      <div className="mb-4 flex animate-fade-up flex-col gap-3 [animation-delay:80ms] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => changeFilter(() => setSearch(e.target.value))}
            placeholder="Search templates…"
            className="h-10 w-full appearance-none rounded-xl border border-stone-300 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => changeFilter(() => setSort(e.target.value))}
            className="h-10 w-full appearance-none rounded-xl border border-stone-300 bg-white pl-4 pr-9 text-sm font-medium text-stone-700 outline-none transition focus:border-indigo-500 dark:border-white/15 dark:bg-stone-900 dark:text-stone-200"
            aria-label="Sort templates"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A–Z)</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>

      {/* ---- Category chips + request a new one ---- */}
      <div className="mb-4 flex animate-fade-up flex-wrap items-center gap-2 [animation-delay:160ms]">
        {categories.length > 0 && (
          <>
            <button
              onClick={() => changeFilter(() => setCategory(""))}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                category === ""
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-white/10 dark:hover:bg-stone-800"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => changeFilter(() => setCategory(c))}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  category === c
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-white/10 dark:hover:bg-stone-800"
                }`}
              >
                {c}
              </button>
            ))}
          </>
        )}
        <button
          onClick={() => setRequestOpen(true)}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 ring-1 ring-indigo-200 transition hover:bg-indigo-50 dark:bg-stone-900 dark:text-indigo-300 dark:ring-indigo-500/30 dark:hover:bg-stone-800"
        >
          Request a category
        </button>
      </div>

      {/* ---- Requested categories (community votes) ---- */}
      {suggestions.length > 0 && (
        <div className="mb-8 animate-fade-up [animation-delay:200ms]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Requested categories
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
              Vote for what you'd love to see next:
            </span>
            {suggestions.map((s) => {
              const voted = votedIds.has(s.id);
              return (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 dark:border-white/20 dark:bg-stone-900 dark:text-stone-200"
                >
                  {s.name}
                  <button
                    onClick={() => upvoteSuggestion(s)}
                    disabled={voted}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition disabled:cursor-default ${
                      voted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-stone-100 text-stone-500 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300"
                    }`}
                    aria-label={`Upvote ${s.name}`}
                  >
                    ▲ {s.votes}
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Recently viewed strip ---- */}
      {recent.length > 0 && !search && !category && page === 1 && (
        <div className="mb-10 animate-fade-up [animation-delay:220ms]">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              Recently viewed
            </h2>
            <button
              onClick={clearRecentHistory}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-stone-400 transition hover:bg-red-50 hover:text-red-600 dark:text-stone-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <svg
                width="13"
                height="13"
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
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {recent.map((t) => (
              <button
                key={t.id}
                onClick={() => setPreviewId(t.id)}
                className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-stone-900"
              >
                <img
                  src={t.thumbnail_url}
                  alt={t.name}
                  className="h-20 w-full object-cover"
                />
                <span className="truncate p-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ---- Grid ---- */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-44 rounded-2xl bg-stone-200 dark:bg-stone-800" />
              <div className="mt-4 h-4 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
              <div className="mt-2 h-3 w-full rounded bg-stone-100 dark:bg-stone-800" />
              <div className="mt-4 h-10 rounded-xl bg-stone-100 dark:bg-stone-800" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center dark:border-white/15 dark:bg-stone-900">
          <span className="text-3xl">🔍</span>
          <h2 className="mt-3 text-lg font-bold text-stone-900 dark:text-stone-100">
            No templates found
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Try a different search or category.
          </p>
          <button
            onClick={() =>
              changeFilter(() => {
                setSearch("");
                setCategory("");
              })
            }
            className="mt-5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t, i) => (
              <TemplateCard
                key={t.id}
                index={i}
                template={t}
                isFavorite={favoriteIds.has(t.id)}
                onFavoriteChange={handleFavoriteChange}
                onPreview={openPreview}
                compareSelected={compareList.some((x) => x.id === t.id)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border border-stone-300 bg-white px-7 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-60 dark:border-white/15 dark:bg-stone-900 dark:text-stone-200"
              >
                {loadingMore
                  ? "Loading…"
                  : `Load more (${shownCount} of ${total})`}
              </button>
            </div>
          )}
        </>
      )}

      {!user && !loading && templates.length > 0 && (
        <div className="mt-12 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-6 py-5 text-center text-sm font-medium text-stone-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-stone-300">
          <Link to="/login" className="font-bold text-indigo-700 hover:underline dark:text-indigo-300">
            Sign in
          </Link>{" "}
          to add templates to your favorites.
        </div>
      )}

      {/* ---- Floating compare bar ---- */}
      {compareList.length > 0 && !showCompare && (
        <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 shadow-xl dark:border-white/10 dark:bg-stone-900">
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            {compareList.length} selected
          </span>
          <button
            onClick={() => {
              if (compareList.length < 2) return toast("Select at least 2 templates to compare.", "info");
              setShowCompare(true);
            }}
            className="rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Compare
          </button>
          <button
            onClick={() => setCompareList([])}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            Clear
          </button>
        </div>
      )}

      {/* ---- Modals ---- */}
      {previewId && (
        <PreviewModal
          templateId={previewId}
          onClose={() => setPreviewId(null)}
          isFavorite={favoriteIds.has(Number(previewId))}
          onFavoriteChange={handleFavoriteChange}
        />
      )}
      {showCompare && (
        <CompareModal templates={compareList} onClose={() => setShowCompare(false)} />
      )}
      {requestOpen && (
        <RequestCategoryModal
          onClose={() => setRequestOpen(false)}
          onCreated={handleRequestCreated}
        />
      )}
    </main>
  );
}