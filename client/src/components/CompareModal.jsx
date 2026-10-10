export default function CompareModal({ templates, onClose }) {
  const rows = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
    { key: "avg_rating", label: "Rating" },
    { key: "rating_count", label: "Total ratings" },
  ];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Compare templates
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 font-bold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            aria-label="Close compare"
          >
            ✕
          </button>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32 border-b border-stone-200 p-3 text-left dark:border-white/10" />
              {templates.map((t) => (
                <th
                  key={t.id}
                  className="border-b border-stone-200 p-3 text-left dark:border-white/10"
                >
                  <img
                    src={t.thumbnail_url}
                    alt={t.name}
                    className="h-20 w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 font-bold text-stone-900 dark:text-stone-100">
                    {t.name}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="align-top">
                <td className="border-b border-stone-100 p-3 font-semibold text-stone-500 dark:border-white/5 dark:text-stone-400">
                  {row.label}
                </td>
                {templates.map((t) => (
                  <td
                    key={t.id}
                    className="border-b border-stone-100 p-3 text-stone-700 dark:border-white/5 dark:text-stone-200"
                  >
                    {row.key === "avg_rating" ? (
                      <span className="text-amber-400">
                        ★ {t.avg_rating ?? 0}
                      </span>
                    ) : (
                      t[row.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
