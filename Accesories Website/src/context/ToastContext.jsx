import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const bg = { success: "#752700", error: "#c0392b", info: "#a44f31" };
  const icon = { success: "✓", error: "✕", info: "ℹ" };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div style={{ position: "fixed", top: "28px", right: "28px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "10px", pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: "13px 20px", background: bg[t.type] || bg.success, color: "#fff",
            borderRadius: "12px", fontSize: "14px", fontWeight: "600",
            boxShadow: "0 6px 24px rgba(0,0,0,0.22)",
            display: "flex", alignItems: "center", gap: "10px",
            animation: "toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <span>{icon[t.type]}</span> {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
