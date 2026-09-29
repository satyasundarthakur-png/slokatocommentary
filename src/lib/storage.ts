/** Tiny localStorage helpers (SSR-safe, never throw). */
export function readPref(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writePref(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** Read a preference that must be one of `valid`, else `fallback`. */
export function readChoice(key: string, valid: readonly string[], fallback: string): string {
  const v = readPref(key);
  return v && valid.includes(v) ? v : fallback;
}
