import { useMemo, useState } from "react";
import { FileUp, Layers, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readDocxText, splitSlokas } from "@/lib/slokaParser";
import type { TikaLength } from "@/lib/book";
import type { FormValues } from "@/components/VerseForm";

const fieldCls =
  "w-full glow-field rounded-xl border border-fuchsia-200 bg-white/80 px-3 py-2.5 text-[0.95rem] text-foreground shadow-sm outline-none placeholder:text-muted-foreground/70";
const labelCls = "mb-1.5 block font-interface text-[0.72rem] font-semibold uppercase text-fuchsia-800";
const SIZES = [25, 50, 100, 0] as const;

export function BulkPanel({
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
  const [granth, setGranth] = useState("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [size, setSize] = useState<number>(25);
  const [start, setStart] = useState(1);
  const [length, setLength] = useState<TikaLength>("medium");
  const [supporting, setSupporting] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);

  const slokas = useMemo(() => splitSlokas(text), [text]);
  const from = Math.min(Math.max(start, 1), Math.max(slokas.length, 1));
  const to = size === 0 ? slokas.length : Math.min(from + size - 1, slokas.length);
  const count = slokas.length === 0 ? 0 : to - from + 1;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    try {
      setText(await readDocxText(f));
      setFileName(f.name);
      setStart(1);
    } catch {
      setError("DOCX ଫାଇଲ୍ ପଢ଼ିହେଲା ନାହିଁ। ଦୟାକରି .docx ଫାଇଲ୍ ଦିଅନ୍ତୁ।");
    }
    e.target.value = "";
  }

  async function run() {
    if (count === 0) {
      setError("କୌଣସି ସଂସ୍କୃତ ଶ୍ଲୋକ ମିଳିଲା ନାହିଁ। DOCX ଅପଲୋଡ୍ କରନ୍ତୁ ବା ଶ୍ଲୋକ ପେଷ୍ଟ କରନ୍ତୁ।");
      return;
    }
    setError(null);
    const name = granth.trim() || "ଶ୍ଲୋକ";
    const items = slokas.slice(from - 1, to).map((s, i) => ({
      verse: s.verse,
      reference: `${s.number || from + i} — ${name}`,
      supportingTexts: supporting.trim(),
      topic: topic.trim(),
      length,
    }));
    await onStart(items);
    setStart(to + 1);
  }

  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-4 font-odia">
      <label className="glow-field flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-fuchsia-300 bg-white/60 px-4 py-5 text-center">
        <FileUp className="size-7 text-fuchsia-600" aria-hidden="true" />
        <span className="text-sm font-semibold text-fuchsia-800">{fileName || "ଶ୍ଲୋକ ଥିବା DOCX ଅପଲୋଡ୍ କରନ୍ତୁ"}</span>
        <span className="text-xs text-muted-foreground">.docx · ॥ ୧.୨ ॥ ଭଳି ସଂଖ୍ୟା ସ୍ୱୟଂ ଚିହ୍ନଟ ହେବ</span>
        <input type="file" accept=".docx" className="sr-only" onChange={onFile} disabled={busy} />
      </label>

      <div>
        <label className={labelCls} htmlFor="bulk-text">ବା ଏଠାରେ ଶ୍ଲୋକ ପେଷ୍ଟ କରନ୍ତୁ</label>
        <textarea
          id="bulk-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"ଶ୍ଲୋକ ୧ ॥ ୧ ॥\n\nଶ୍ଲୋକ ୨ ॥ ୨ ॥"}
          className={`${fieldCls} font-deva leading-loose`}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="granth">ଗ୍ରନ୍ଥ ନାମ</label>
        <input id="granth" value={granth} onChange={(e) => setGranth(e.target.value)} placeholder="ଗ୍ରନ୍ଥ ନାମ" className={fieldCls} />
      </div>

      <p className="rounded-xl bg-gradient-to-r from-amber-100 to-fuchsia-100 px-3 py-2 text-sm font-semibold text-fuchsia-900">
        {slokas.length} ଶ୍ଲୋକ ମିଳିଲା
      </p>

      <div>
        <span className={labelCls}>ଏକ ଥରରେ କେତେ ଶ୍ଲୋକ</span>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSize(n)}
              className={`glow-row rounded-xl border px-2 py-2 font-interface text-sm font-bold ${
                size === n
                  ? "border-fuchsia-500 bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white shadow-[0_0_18px_#d946ef88]"
                  : "border-fuchsia-200 bg-white/70 text-fuchsia-900"
              }`}
            >
              {n === 0 ? "ସମସ୍ତ" : n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="start">ଆରମ୍ଭ ସଂଖ୍ୟା</label>
          <input id="start" type="number" min={1} value={start} onChange={(e) => setStart(Number(e.target.value) || 1)} className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="bulk-length">ଦୀର୍ଘତା</label>
          <select id="bulk-length" value={length} onChange={(e) => setLength(e.target.value as TikaLength)} className={fieldCls}>
            <option value="short">ସଂକ୍ଷିପ୍ତ</option>
            <option value="medium">ମଧ୍ୟମ</option>
            <option value="long">ଦୀର୍ଘ</option>
          </select>
        </div>
      </div>

      <input value={supporting} onChange={(e) => setSupporting(e.target.value)} placeholder="ସହାୟକ ଗ୍ରନ୍ଥ (ଐଚ୍ଛିକ)" className={fieldCls} />
      <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="ବିଷୟ (ଐଚ୍ଛିକ)" className={fieldCls} />

      {error && (
        <p className="rounded-xl border-l-4 border-destructive bg-white/80 px-3 py-2 text-sm leading-relaxed text-destructive">{error}</p>
      )}

      {busy && progress ? (
        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-white/70">
            <div className="glow-btn h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-center text-sm text-fuchsia-900">
            {progress.done} / {progress.total} ସମ୍ପୂର୍ଣ୍ଣ{progress.failed ? ` · ${progress.failed} ବିଫଳ` : ""}
          </p>
          <Button type="button" onClick={onCancel} variant="outline" className="w-full rounded-xl border-fuchsia-300 text-fuchsia-800">
            <Square aria-hidden="true" /> ବନ୍ଦ କରନ୍ତୁ
          </Button>
        </div>
      ) : (
        <Button type="button" onClick={run} disabled={busy || count === 0} className="glow-btn h-12 w-full rounded-xl font-interface text-[0.95rem] font-semibold text-white">
          <Layers aria-hidden="true" />
          {count > 0 ? `${from}–${to} (${count} ଶ୍ଲୋକ) ରଚନା କରନ୍ତୁ` : "ଟୀକା ରଚନା କରନ୍ତୁ"}
        </Button>
      )}
    </div>
  );
}
