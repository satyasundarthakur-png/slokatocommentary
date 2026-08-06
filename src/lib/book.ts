export type TikaLength = "short" | "medium" | "long";

export interface TikaUnit {
  id: string;
  verse: string;
  reference: string;
  supportingTexts: string;
  topic: string;
  length: TikaLength;
  commentary: string;
  createdAt: number;
}

const KEY = "ashtavakra-tika-book-v1";

export function loadBook(): TikaUnit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TikaUnit[]) : [];
  } catch {
    return [];
  }
}

export function saveBook(units: TikaUnit[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(units));
  } catch {
    /* quota — ignore */
  }
}

export function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) return arr;
  next.splice(to, 0, item);
  return next;
}

/** Split commentary into paragraph blocks, treating "●" lines as unit separators. */
export function parseCommentary(text: string): Array<{ type: "para" | "sep"; text: string }> {
  return text
    .split(/\n{2,}|\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) =>
      /^[●•]+$/.test(line)
        ? ({ type: "sep", text: "●" } as const)
        : ({ type: "para", text: line } as const),
    );
}
