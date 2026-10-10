import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { request } from "../lib/api";
import TemplateCard from "../components/TemplateCard";
import PreviewModal from "../components/PreviewModal";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await request(api.get("/favorites"));
      if (res.ok) setFavorites(res.data.favorites);
      else setError(res.message);
      setLoading(false);
    }
    load();
  }, []);

  function openPreview(t) {
    setPreviewId(t.id);
  }

  function handleFavoriteChange(id, isNowFavorite) {
    if (!isNowFavorite) {
      setFavorites((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <section className="mb-12">
        <span className="rule" />
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          My favorites
        </h1>
        <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
          Templates you've saved for quick access.
        </p>
      </section>

      {error && (
        <div className="mb-8 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-44 rounded-2xl bg-stone-200 dark:bg-stone-800" />
              <div className="mt-4 h-4 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
              <div className="mt-4 h-10 rounded-xl bg-stone-100 dark:bg-stone-800" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center dark:border-white/15 dark:bg-stone-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-2xl dark:from-emerald-500/20 dark:to-teal-500/20">
            ⭐
          </div>
          <h2 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-100">
            Nothing saved yet
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Browse the collection and tap Favorite to add templates here.
          </p>
          <Link
            to="/templates"
            className="mt-6 inline-block rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            Browse templates →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
           {favorites.map((t) => (
             <TemplateCard
               key={t.id}
               template={t}
               isFavorite={true}
               onFavoriteChange={handleFavoriteChange}
               onPreview={openPreview}
             />
           ))}
        </div>
      )}

      {previewId && (
        <PreviewModal
          templateId={previewId}
          onClose={() => setPreviewId(null)}
          isFavorite={true}
          onFavoriteChange={handleFavoriteChange}
        />
      )}
    </main>
  );
}
