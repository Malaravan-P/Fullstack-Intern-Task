import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { request } from "../lib/api";

function fmtTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationBell({ onOpenChange }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await request(api.get("/notifications"));
    setLoading(false);
    if (res.ok) {
      setItems(res.data.notifications);
      setUnread(res.data.unread);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function openBell() {
    const next = !open;
    setOpen(next);
    if (next) {
      await load(); // refresh on open so new items show
    }
  }

  async function markRead(n) {
    if (!n.read) {
      const res = await request(api.patch("/notifications/read", { ids: [n.id] }));
      if (res.ok) {
        setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
        setUnread((u) => Math.max(0, u - 1));
      }
    }
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  }

  async function markAllRead() {
    const res = await request(api.patch("/notifications/read", { all: true }));
    if (res.ok) {
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnread(0);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={openBell}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Invisible overlay to catch outside clicks */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-white/10 dark:bg-stone-900 sm:w-96">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-white/10">
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Notifications
              </p>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-lg dark:bg-stone-800">
                    🔕
                  </div>
                  <p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
                    You're all caught up
                  </p>
                  <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                    Approvals and updates will land here.
                  </p>
                </div>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => markRead(n)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800 ${
                          n.read ? "" : "bg-indigo-50/60 dark:bg-indigo-500/10"
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            n.read ? "bg-transparent" : "bg-indigo-500"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {n.title}
                          </span>
                          {n.body && (
                            <span className="mt-0.5 block text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                              {n.body}
                            </span>
                          )}
                          <span className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                            {fmtTime(n.created_at)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}