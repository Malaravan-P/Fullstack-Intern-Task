import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { request } from "../lib/api";
import BackButton from "../components/BackButton";
import TemplateCard from "../components/TemplateCard";
import { useToast } from "../context/ToastContext";

function CoverStrip({ covers }) {
  if (!covers.length) {
    return (
      <div className="flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 text-stone-300 dark:from-stone-800 dark:to-stone-900 dark:text-stone-600">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      </div>
    );
  }
  const imgs = covers.slice(0, 3);
  const extra = covers.length - imgs.length;
  return (
    <div className="grid h-28 grid-cols-3 gap-1 overflow-hidden rounded-2xl">
      {imgs.map((c, i) => (
        <div key={c.template_id} className="relative h-full w-full overflow-hidden">
          <img src={c.thumbnail_url} alt={c.name} className="h-full w-full object-cover" />
          {extra > 0 && i === imgs.length - 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 text-xs font-bold text-white">
              +{extra}
            </div>
          )}
        </div>
      ))}
    </div>
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
      toast("Collection deleted.", "success");
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
      toast("Removed from collection.", "success");
    } else toast(res.message, "error");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <BackButton />
      <section className="mb-10">
        <span className="rule" />
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          My collections
        </h1>
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
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {creating ? "Creating…" : "New collection"}
        </button>
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
            {collections.map((c) => (
              <div
                key={c.id}
                className="group cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-stone-900"
                onClick={() => toggleDetail(c.id)}
              >
                <CoverStrip covers={c.covers} />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-stone-900 dark:text-stone-100">
                      {c.name}
                    </h3>
                    <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
                      {c.template_count} {c.template_count === 1 ? "template" : "templates"}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(c.id);
                        setEditingName(c.name);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                      aria-label={`Rename ${c.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(c.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                      aria-label={`Delete ${c.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
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