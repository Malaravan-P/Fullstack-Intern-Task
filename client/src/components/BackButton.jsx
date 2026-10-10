import { useNavigate } from "react-router-dom";

// Returns the user to the previous page, or home if there's no history.
export default function BackButton({ inRow = false }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
      }}
      className={`flex w-max items-center gap-2 rounded-full border border-stone-200 bg-white py-2 pl-3 pr-4 text-sm font-semibold text-stone-600 shadow-sm transition hover:-translate-x-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow dark:border-white/10 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300 ${
        inRow ? "" : "mb-5 -ml-1"
      }`}
      aria-label="Go back"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}