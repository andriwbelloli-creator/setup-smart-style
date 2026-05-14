import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

const PREFIX = "hol:form:";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type StorageValue<T> = { v: T; t: number };

function readStored<T>(key: string, ttlMs: number): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StorageValue<T>;
    if (!parsed || typeof parsed.t !== "number") return undefined;
    if (Date.now() - parsed.t > ttlMs) {
      window.localStorage.removeItem(PREFIX + key);
      return undefined;
    }
    return parsed.v;
  } catch {
    return undefined;
  }
}

function writeStored<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    const payload: StorageValue<T> = { v: value, t: Date.now() };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    // Storage full or unavailable — fail silently. Form still works in-memory.
  }
}

function clearStored(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {}
}

/**
 * Drop-in replacement for `useState` that mirrors the value to `localStorage`
 * with a TTL. Use for form fields the user shouldn't have to retype after a
 * refresh, navigation away, or crash. Auth state is already persisted by
 * Supabase — this is purely for form scratch state.
 *
 * Returns `[value, setValue, clear]` where `clear()` wipes the stored copy
 * (call after successful submit so the next visit starts blank).
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
  options: { ttlMs?: number; enabled?: boolean } = {},
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const { ttlMs = DEFAULT_TTL_MS, enabled = true } = options;
  const initialRef = useRef(initial);
  const [value, setValue] = useState<T>(() => {
    if (!enabled) return initialRef.current;
    const stored = readStored<T>(key, ttlMs);
    return stored !== undefined ? stored : initialRef.current;
  });

  useEffect(() => {
    if (!enabled) return;
    writeStored(key, value);
  }, [key, value, enabled]);

  const clear = () => {
    clearStored(key);
    setValue(initialRef.current);
  };

  return [value, setValue, clear];
}

/** Manually wipe a persisted field by key — useful in submit handlers. */
export function clearPersistedField(key: string) {
  clearStored(key);
}

/** Wipe every persisted form field. Call on logout or “limpar formulário”. */
export function clearAllPersistedForms() {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {}
}
