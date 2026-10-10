import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { request } from "../lib/api";
import BackButton from "../components/BackButton";
import SortSelect from "../components/SortSelect";
import TemplateCard from "../components/TemplateCard";
import { useToast } from "../context/ToastContext";

function CollectionCover({ cover, name }) {
  if (!cover) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-300 dark:from-indigo-500/15 dark:to-indigo-500/5 dark:text-indigo-400/60">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={cover.thumbnail_url}
      alt={name}
      loading="lazy"
      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
    />
  );
}

export default function Collections() {
  const { toast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sort, setSort] = useState("newest");

  const sortedCollections = [...collections].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-z-a":
        return b.name.localeCompare(a.name);
      case "templates":
        return b.template_count - a.template_count || a.name.localeCompare(b.name);
      case "newest":
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const load = async () => {
    const res = await request(api.get("/collections"));
    if (res.ok) setCollections(res.data.collections);
    else toast(res.message, "error");
  };

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const res = await request(api.post("/collections", { name }));
    setCreating(false);
    if (res.ok) {
      setCollections((prev) => [{ ...res.data.collection, covers: [] }, ...prev]);
      setNewName("");
      toast("Collection created.", "success");
    } else toast(res.message, "error");
  }

  async function rename(id) {
    const name = editingName.trim();
    if (!name) return;
    const res = await request(api.patch(`/collections/${id}`, { name }));
    if (res.ok) {
      setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
      setEditingId(null);
      toast("Collection renamed.", "success");
    } else toast(res.message, "error");
  }

  async function remove(id) {
    if (!window.confirm("Delete this collection? Its templates are not removed from your account.")) return;
    const res = await request(api.delete(`/collections/${id}`));
    if (res.ok) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      if (openId === id) {
        setOpenId(null);
        setDetail(null);
      }
      toast("Collection deleted.", "error");
    } else toast(res.message, "error");
  }

  async function toggleDetail(id) {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetailLoading(true);
    const res = await request(api.get(`/collections/${id}`));
    setDetailLoading(false);
    if (res.ok) setDetail(res.data.collection);
    else toast(res.message, "error");
  }

  async function removeTemplate(templateId) {
    const res = await request(api.delete(`/collections/${openId}/templates/${templateId}`));
    if (res.ok) {
      setDetail((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== templateId) }));
      setCollections((prev) =>
        prev.map((c) =>
          c.id === openId ? { ...c, template_count: Math.max(0, c.template_count - 1) } : c
        )
      );
      toast("Removed from collection.", "warning");
    } else toast(res.message, "error");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <section className="mb-10">
        <span className="rule" />
        <div className="mt-3 flex items-center justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
            My collections
          </h1>
          <BackButton inRow />
        </div>
        <p className="mt-3 text-lg text-stone-500 dark:text-stone-400">
          Private folders for the templates you like — a template can live in
          several collections at once.
        </p>
      </section>

{/* Create box */}
      <form
        onSubmit={create}
        className="mb-10 flex flex-col gap-3 rounded-2xl border border-dashed border-stone-300 bg-white p-5 dark:border-white/15 dark:bg-stone-900 sm:flex-row"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection name, e.g. Portfolio Inspiration"
          maxLength={60}
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/15 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="h-10 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {creating ? "Creating…" : "New collection"}
          </button>
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-28 rounded-2xl bg-stone-200 dark:bg-stone-800" />
              <div className="mt-3 h-4 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center dark:border-white/15 dark:bg-stone-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-indigo-100 text-2xl dark:from-amber-500/20 dark:to-indigo-500/20">
            📁
          </div>
          <h2 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-100">
            No collections yet
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Create your first collection above, or open a template and use
            &quot;Add to collection&quot;.
          </p>
          <Link
            to="/templates"
            className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Browse templates →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCollections.map((c, i) => {
              const cover = c.covers[c.covers.length - 1] || null;
              return (
                <article
                  key={c.id}
                  className="group flex animate-fade-up cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-stone-900"
                  style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
                  onClick={() => toggleDetail(c.id)}
                >
                  <div className="relative h-44 overflow-hidden">
                    <CollectionCover cover={cover} name={c.name} />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 shadow-sm dark:bg-stone-900/90 dark:text-indigo-300">
                      {c.template_count} {c.template_count === 1 ? "template" : "templates"}
                    </span>
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(c.id);
                          setEditingName(c.name);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sm text-stone-600 shadow-sm transition hover:bg-white dark:bg-stone-900/90 dark:text-stone-300 dark:hover:bg-stone-800"
                        aria-label={`Rename ${c.name}`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(c.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sm text-red-500 shadow-sm transition hover:bg-red-50 dark:bg-stone-900/90 dark:hover:bg-red-500/10"
                        aria-label={`Delete ${c.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="truncate font-semibold text-stone-900 dark:text-stone-100">
                      {c.name}
                    </h3>
                    <div className="mt-4 flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetail(c.id);
                        }}
                        className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-stone-200 px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/10 dark:text-stone-200 dark:hover:bg-stone-800"
                      >
                        Open collection →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {editingId && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm dark:bg-black/70">
              <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-stone-900">
                <h3 className="font-bold text-stone-900 dark:text-stone-100">
                  Rename collection
                </h3>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  maxLength={60}
                  autoFocus
                  className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm dark:border-white/15 dark:bg-stone-900 dark:text-stone-100"
                />
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(null);
                    }}
                    className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/15 dark:text-stone-200 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      rename(editingId);
                      setEditingId(null);
                    }}
                    disabled={!editingName.trim()}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {openId && (
            <section>
              {detailLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
                  ))}
                </div>
              ) : detail && detail.templates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-white/15 dark:bg-stone-900">
                  <p className="font-semibold text-stone-700 dark:text-stone-200">
                    This collection is empty
                  </p>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    Open a template and use &quot;Add to collection&quot;.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="mb-4 font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {detail?.name}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {detail?.templates.map((t) => (
                      <div key={t.id} className="relative">
                        <TemplateCard template={t} isFavorite={false} />
                        <button
                          onClick={() => removeTemplate(t.id)}
                          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-red-500 shadow transition hover:bg-red-50 dark:bg-stone-900/90"
                          aria-label="Remove from collection"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}