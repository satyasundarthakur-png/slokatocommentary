export interface ParsedSloka {
  verse: string;
  /** Verse number found in the closing "॥ १.२ ॥" marker, if any. */
  number: string;
}

const DEVA = /[\u0900-\u097F]/g;
const HEADING = /अध्याय|प्रकरण|काण्ड|स्कन्ध|खण्ड|पर्व|श्रीमद्|उपनिषद्|—|योगः\s*$/;
/** A line ends a verse when it closes with ॥, optionally as "॥ 12 ॥". */
const VERSE_END = /॥\s*([०-९0-9][०-९0-9.\-–]*)?\s*॥?\s*$/;

export async function readDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}

/** Split raw text (from a DOCX or pasted) into individual Sanskrit slokas. */
export function splitSlokas(raw: string): ParsedSloka[] {
  const out: ParsedSloka[] = [];
  let buf: string[] = [];
  let num = "";
  const flush = () => {
    const verse = buf.join("\n").trim();
    if ((verse.match(DEVA)?.length ?? 0) >= 8) out.push({ verse, number: num });
    buf = [];
    num = "";
  };
  const lines = raw.split(/\r?\n/);
  // DOCX extraction puts a blank line between paragraphs, so a verse spread over
  // several paragraphs can only be split on its closing ॥ marker. Blank lines are
  // used as separators only when the text has no ॥ markers at all.
  const hasMarkers = lines.some((l) => VERSE_END.test(l.trim()));
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (!hasMarkers) flush();
      continue;
    }
    if (!/[\u0900-\u097F]/.test(t)) continue; // skip English/other headings
    // headings ("अध्याय २", "श्रीमद्भगवद्गीता — …", "…योगः") start no verse
    if (buf.length === 0 && !/[।॥]/.test(t) && ((t.match(DEVA)?.length ?? 0) < 12 || HEADING.test(t))) continue;
    buf.push(t);
    const m = t.match(VERSE_END);
    if (m) {
      num = m[1] ?? "";
      flush();
    }
  }
  flush();
  return out;
}
