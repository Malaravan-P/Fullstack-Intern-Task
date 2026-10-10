import { useEffect, useState } from "react";
import api, { request } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function CollectionPickerModal({ templateId, onClose }) {
  const { toast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await request(api.get(`/collections?template_id=${templateId}`));
      if (res.ok) setCollections(res.data.collections);
      setLoading(false);
    })();
  }, [templateId]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function toggle(c) {
    if (busyId) return;
    setBusyId(c.id);
    const res = c.has
      ? await request(api.delete(`/collections/${c.id}/templates/${templateId}`))
      : await request(api.post(`/collections/${c.id}/templates`, { template_id: templateId }));
    setBusyId(null);
    if (res.ok) {
      setCollections((prev) =>
        prev.map((item) =>
          item.id === c.id
            ? { ...item, has: !c.has, template_count: item.template_count + (c.has ? -1 : 1) }
            : item
        )
      );
      toast(c.has ? `Removed from ${c.name}` : `Added to ${c.name}`, "success");
    } else {
      toast(res.message, "error");
    }
  }

  async function create(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const res = await request(api.post("/collections", { name }));
    if (!res.ok) {
      setCreating(false);
      return toast(res.message, "error");
    }
    const collection = res.data.collection;
    // Immediately add this template to the new collection.
    const add = await request(
      api.post(`/collections/${collection.id}/templates`, { template_id: templateId })
    );
    setCreating(false);
    if (add.ok) {
      setCollections((prev) => [{ ...collection, has: true, template_count: 1 }, ...prev]);
      setNewName("");
      toast(`Created "${name}" and added template.`, "success");
    } else {
      setCollections((prev) => [{ ...collection, has: false, template_count: 0 }, ...prev]);
      toast(add.message, "error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-white/10 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-white/10">
          <h3 className="font-bold text-stone-900 dark:text-stone-100">
            Add to collection
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <p className="p-6 text-center text-sm text-stone-500 dark:text-stone-400">
              No collections yet — create one below.
            </p>
          ) : (
            <ul className="space-y-1">
              {collections.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => toggle(c)}
                    disabled={busyId === c.id}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-stone-50 disabled:opacity-60 dark:hover:bg-stone-800"
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold text-white transition ${
                        c.has
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-stone-300 dark:border-white/20"
                      }`}
                    >
                      {c.has ? "✓" : ""}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {c.name}
                      </span>
                      <span className="block text-xs text-stone-400 dark:text-stone-500">
                        {c.template_count} {c.template_count === 1 ? "template" : "templates"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={create}
          className="flex gap-2 border-t border-stone-200 p-3 dark:border-white/10"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New collection name"
            maxLength={60}
            className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}