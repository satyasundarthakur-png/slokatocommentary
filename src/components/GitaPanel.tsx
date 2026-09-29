import { useState } from "react";
import { BookOpen, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GITA_VERSES, fetchGitaVerse } from "@/lib/gita";
import type { TikaLength } from "@/lib/book";
import type { FormValues } from "@/components/VerseForm";

const fieldCls =
  "w-full glow-field rounded-xl border border-fuchsia-200 bg-white/80 px-3 py-2.5 text-[0.95rem] text-foreground shadow-sm outline-none";
const labelCls = "mb-1.5 block font-interface text-[0.72rem] font-semibold uppercase text-fuchsia-800";

export function GitaPanel({
  busy,
  progress,
  onStart,
  onCancel,
}: {
  busy: boolean;
  progress: { done: number; total: number; failed: number } | null;
  onStart: (items: FormValues[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [ch, setCh] = useState(1);
  const [from, setFrom] = useState(1);
  const [size, setSize] = useState(25);
  const [length, setLength] = useState<TikaLength>("medium");
  const [acharyas, setAcharyas] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const max = GITA_VERSES[ch - 1]!;
  const start = Math.min(Math.max(from, 1), max);
  const end = size === 0 ? max : Math.min(start + size - 1, max);

  async function run() {
    setError(null);
    setFetching(true);
    const items: FormValues[] = [];
    try {
      for (let v = start; v <= end; v += 6) {
        const batch = Array.from({ length: Math.min(6, end - v + 1) }, (_, k) => v + k);
        const got = await Promise.all(batch.map((n) => fetchGitaVerse(ch, n, acharyas)));
        got.forEach((g, k) =>
          items.push({ verse: g.verse, reference: `${ch}.${batch[k]} — ଭଗବଦ୍ଗୀତା`, supportingTexts: g.supporting, topic: "", length }),
        );
      }
    } catch {
      setFetching(false);
      setError("ଶ୍ଲୋକ ଆଣିହେଲା ନାହିଁ — ଇଣ୍ଟରନେଟ୍ ଯାଞ୍ଚ କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।");
      return;
    }
    setFetching(false);
    await onStart(items);
    if (end >= max) {
      if (ch < 18) { setCh(ch + 1); setFrom(1); }
    } else setFrom(end + 1);
  }

  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-4 font-odia">
      <p className="rounded-xl bg-gradient-to-r from-amber-100 to-fuchsia-100 px-3 py-2 text-sm text-fuchsia-900">
        ଭଗବଦ୍ଗୀତାର ମୂଳ ଶ୍ଲୋକ ସ୍ୱୟଂ ଆଣି ଟୀକା ରଚନା କରନ୍ତୁ — ଟାଇପ୍ କରିବାର ଆବଶ୍ୟକତା ନାହିଁ।
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="g-ch">ଅଧ୍ୟାୟ</label>
          <select id="g-ch" value={ch} onChange={(e) => { setCh(Number(e.target.value)); setFrom(1); }} className={fieldCls}>
            {GITA_VERSES.map((n, i) => (<option key={i} value={i + 1}>{i + 1} ({n})</option>))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="g-from">ଆରମ୍ଭ ଶ୍ଲୋକ</label>
          <input id="g-from" type="number" min={1} max={max} value={from} onChange={(e) => setFrom(Number(e.target.value) || 1)} className={fieldCls} />
        </div>
      </div>
      <div>
        <span className={labelCls}>ଏକ ଥରରେ କେତେ ଶ୍ଲୋକ</span>
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 100, 0].map((n) => (
            <button key={n} type="button" onClick={() => setSize(n)}
              className={`glow-row rounded-xl border px-2 py-2 font-interface text-sm font-bold ${size === n ? "border-fuchsia-500 bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white shadow-[0_0_18px_#d946ef88]" : "border-fuchsia-200 bg-white/70 text-fuchsia-900"}`}>
              {n === 0 ? "ଅଧ୍ୟାୟ ଶେଷ" : n}
            </button>
          ))}
        </div>
      </div>
      <select value={length} onChange={(e) => setLength(e.target.value as TikaLength)} className={fieldCls} aria-label="ଦୀର୍ଘତା">
        <option value="short">ସଂକ୍ଷିପ୍ତ</option><option value="medium">ମଧ୍ୟମ</option><option value="long">ଦୀର୍ଘ</option>
      </select>
      <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-white/60 p-3 text-sm text-fuchsia-900">
        <input type="checkbox" checked={acharyas} onChange={(e) => setAcharyas(e.target.checked)} className="mt-1 accent-fuchsia-600" />
        <span>ଶଙ୍କର, ରାମାନୁଜ, ମଧୁସୂଦନ, ଶ୍ରୀଧର — ଆଚାର୍ଯ୍ୟଙ୍କ ଭାଷ୍ୟକୁ ସହାୟକ ସନ୍ଦର୍ଭ ରୂପେ ବ୍ୟବହାର କରନ୍ତୁ</span>
      </label>
      {error && <p className="rounded-xl border-l-4 border-destructive bg-white/80 px-3 py-2 text-sm text-destructive">{error}</p>}
      {busy && progress ? (
        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-white/70"><div className="glow-btn h-full rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
          <p className="text-center text-sm text-fuchsia-900">{progress.done} / {progress.total}{progress.failed ? ` · ${progress.failed} ବିଫଳ` : ""}</p>
          <Button type="button" onClick={onCancel} variant="outline" className="w-full rounded-xl border-fuchsia-300 text-fuchsia-800"><Square aria-hidden="true" /> ବନ୍ଦ କରନ୍ତୁ</Button>
        </div>
      ) : (
        <Button type="button" onClick={run} disabled={busy || fetching} className="glow-btn h-12 w-full rounded-xl font-interface text-[0.95rem] font-semibold text-white">
          <BookOpen aria-hidden="true" />
          {fetching ? "ଶ୍ଲୋକ ଆଣୁଛି…" : `${ch}.${start}–${ch}.${end} (${end - start + 1}) ରଚନା କରନ୍ତୁ`}
        </Button>
      )}
      <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
        ଶ୍ଲୋକ ତଥ୍ୟ: <a className="underline" href="https://github.com/vedicscriptures/vedicscriptures.github.io" target="_blank" rel="noreferrer">vedicscriptures Bhagavad Gita API</a> (MIT) — ଅ-ବାଣିଜ୍ୟିକ ବ୍ୟବହାର ପାଇଁ ମାଗଣା।
      </p>
    </div>
  );
}
