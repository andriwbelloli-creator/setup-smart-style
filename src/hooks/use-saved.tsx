import { useEffect, useState, useCallback } from "react";

const KEY_LIKES = "deskly:likes";
const KEY_SAVES = "deskly:saves";

function read(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch { return new Set(); }
}
function write(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify([...set]));
  window.dispatchEvent(new CustomEvent("deskly:storage", { detail: key }));
}

function useStoreSet(key: string) {
  const [set, setSet] = useState<Set<string>>(() => read(key));
  useEffect(() => {
    const onChange = () => setSet(read(key));
    window.addEventListener("deskly:storage", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("deskly:storage", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [key]);
  const toggle = useCallback((id: string) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      write(key, next);
      return next;
    });
  }, [key]);
  const has = useCallback((id: string) => set.has(id), [set]);
  return { set, has, toggle, count: set.size };
}

export const useLikes = () => useStoreSet(KEY_LIKES);
export const useSaves = () => useStoreSet(KEY_SAVES);
