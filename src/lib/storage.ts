"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();

function subscribe(key: string, cb: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(cb);
  return () => {
    listeners.get(key)?.delete(cb);
  };
}

function notify(key: string) {
  listeners.get(key)?.forEach((cb) => cb());
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    notify(key);
  } catch {
    /* ignore */
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const getSnapshot = useCallback(() => readRaw(key), [key]);
  const getServerSnapshot = useCallback(() => null, []);
  const raw = useSyncExternalStore(
    (cb) => subscribe(key, cb),
    getSnapshot,
    getServerSnapshot,
  );

  const value: T = raw === null
    ? initial
    : (() => {
        try {
          return JSON.parse(raw) as T;
        } catch {
          return initial;
        }
      })();

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = (() => {
        const r = readRaw(key);
        if (r === null) return initial;
        try {
          return JSON.parse(r) as T;
        } catch {
          return initial;
        }
      })();
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(current) : next;
      writeRaw(key, JSON.stringify(resolved));
    },
    [key, initial],
  );

  return [value, setValue];
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
