import { useEffect, useRef, useState } from "react";
import api, { request } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function TemplateCard({
  template,
  isFavorite,
  onFavoriteChange,
  onPreview,
  compareSelected,
  onToggleCompare,
  index = 0,
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [favorite, setFavorite] = useState(isFavorite);
  const [busy, setBusy] = useState(false);
  const starRef = useRef(null);

  // Stay in sync when favorites change elsewhere (e.g. inside the preview modal).
  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  async function toggleFavorite(e) {
    e.stopPropagation();
    if (busy) return;
    if (!token) return toast("Sign in to save favorites.", "info");
    setBusy(true);

    if (!favorite) {
      const res = await request(api.post(`/favorites/${template.id}`, {}));
      if (res.ok || res.status === 409) {
        setFavorite(true);
        onFavoriteChange?.(template.id, true);
        starRef.current?.classList.remove("star-pop");
        void starRef.current?.offsetWidth;
        starRef.current?.classList.add("star-pop");
        toast("Added to favorites", "success");
      } else {
        toast(res.message, "error");
      }
    } else {
      const res = await request(api.delete(`/favorites/${template.id}`));
      if (res.ok) {
        setFavorite(false);
        onFavoriteChange?.(template.id, false);
        toast("Removed from favorites", "warning");
      } else {
        toast(res.message, "error");
      }
    }

    setBusy(false);
  }

  const rating = Number(template.avg_rating) || 0;

  return (
    <article
      className="group flex animate-fade-up cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-stone-900"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
      onClick={() => onPreview?.(template)}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={template.thumbnail_url}
          alt={template.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 shadow-sm dark:bg-stone-900/90 dark:text-indigo-300">
          {template.category}
        </span>
        {onToggleCompare && (
          <label
            className="absolute right-3 top-3 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-600 shadow-sm dark:bg-stone-900/90 dark:text-stone-300"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={!!compareSelected}
              onChange={() => onToggleCompare(template)}
              className="h-3.5 w-3.5 accent-indigo-600"
            />
            Compare
          </label>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            {template.name}
          </h3>
          <span className="shrink-0 text-xs text-amber-400">
            ★ {rating}
            <span className="ml-1 text-stone-400">({template.rating_count ?? 0})</span>
          </span>
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-stone-500 dark:text-stone-400">
          {template.description}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
            className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-stone-200 px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/10 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Preview
          </button>
          <button
            onClick={toggleFavorite}
            disabled={busy}
            ref={starRef}
            className={`flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition disabled:opacity-60 ${
              favorite
                ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30"
                : "bg-stone-900 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
            }`}
          >
            {favorite ? "★ Saved" : "☆ Favorite"}
          </button>
        </div>
      </div>
    </article>
  );
}
