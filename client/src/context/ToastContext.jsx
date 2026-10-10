import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

const styles = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-800",
  error: "border-red-300 bg-red-50 text-red-700",
  info: "border-indigo-300 bg-indigo-50 text-indigo-700",
};

const icons = { success: "✓", error: "✕", info: "ℹ" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-up pointer-events-auto flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${styles[t.type] || styles.info}`}
            role="status"
          >
            <span className="font-bold">{icons[t.type] || icons.info}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
