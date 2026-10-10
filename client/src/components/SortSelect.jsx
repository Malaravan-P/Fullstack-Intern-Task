import { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-z-a", label: "Name Z–A" },
  { value: "templates", label: "Most templates" },
];

export default function SortSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(val) {
    onChange(val);
    setOpen(false);
  }

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || "Sort";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-32 rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 hover:bg-stone-50 dark:border-white/15 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center justify-between gap-2">
          {currentLabel}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          className="absolute z-10 mt-1 max-h-48 w-32 overflow-auto rounded-xl border border-stone-200 bg-white shadow-lg dark:border-white/10 dark:bg-stone-900"
          role="listbox"
        >
          {SORT_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              className="cursor-pointer px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => selectOption(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
