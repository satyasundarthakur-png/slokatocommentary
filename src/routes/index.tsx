import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Flower2 } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { BookSidebar } from "@/components/BookSidebar";
import { CommentaryPanel } from "@/components/CommentaryPanel";
import { VerseForm, type FormValues } from "@/components/VerseForm";
import { loadBook, move, saveBook, type TikaUnit } from "@/lib/book";
import { exportBookDocx } from "@/lib/docxExport";
import { generateTika } from "@/lib/tika.functions";
import { Button } from "@/components/ui/button";
import { GitaPanel } from "@/components/GitaPanel";
import { BulkPanel } from "@/components/BulkPanel";
import { LANGUAGES, DEFAULT_LANGUAGE_ID, loadLanguageId, saveLanguageId } from "@/lib/languages";
import { MODELS, DEFAULT_MODEL_ID, loadModelId, saveModelId } from "@/lib/models";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sloka Commentary — ଶ୍ଲୋକ ଓଡ଼ିଆ ଟୀକା" },
      {
        name: "description",
        content:
          "Compose Odia Vedantic commentary on Sanskrit verses, verse by verse, and export the whole book as a print-ready DOCX.",
      },
      { property: "og:title", content: "Sloka Commentary — ଶ୍ଲୋକ ଓଡ଼ିଆ ଟୀକା" },
      {
        property: "og:description",
        content:
          "A manuscript editor for Odia Vedantic commentary: paste a Sanskrit verse, receive a traditional ṭīkā, build your book.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [units, setUnits] = useState<TikaUnit[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk" | "gita">("single");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [languageId, setLanguageId] = useState(DEFAULT_LANGUAGE_ID);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);
  const cancelRef = useRef(false);
  const unitsRef = useRef<TikaUnit[]>([]);
  const generate = useServerFn(generateTika);

  useEffect(() => {
    setModelId(loadModelId());
    setLanguageId(loadLanguageId());
    const stored = loadBook();
    setUnits(stored);
    setActiveId(stored[stored.length - 1]?.id ?? null);
  }, []);

  const active = useMemo(
    () => units.find((u) => u.id === activeId) ?? null,
    [units, activeId],
  );

  function persist(next: TikaUnit[]) {
    unitsRef.current = next;
    setUnits(next);
    saveBook(next);
  }

  async function handleSubmit(values: FormValues) {
    setBusy(true);
    try {
      const { commentary } = await generate({ data: { ...values, modelId, language: languageId } });
      const unit: TikaUnit = {
        id: crypto.randomUUID(),
        ...values,
        language: languageId,
        commentary,
        createdAt: Date.now(),
      };
      persist([...units, unit]);
      setActiveId(unit.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ତ୍ରୁଟି ହେଲା।");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegenerate() {
    if (!active) return;
    setBusy(true);
    try {
      const { commentary } = await generate({
        data: {
          verse: active.verse,
          reference: active.reference,
          supportingTexts: active.supportingTexts,
          topic: active.topic,
          length: active.length,
          modelId,
          language: active.language ?? "or",
        },
      });
      persist(
        units.map((u) =>
          u.id === active.id ? { ...u, commentary, createdAt: Date.now() } : u,
        ),
      );
      toast.success("ଏକକ ପୁନଃ ରଚିତ ହେଲା।");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ତ୍ରୁଟି ହେଲା।");
    } finally {
      setBusy(false);
    }
  }

  async function generateWithRetry(v: FormValues): Promise<{ text: string | null; err: string }> {
    let err = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { commentary } = await generate({ data: { ...v, modelId, language: languageId } });
        return { text: commentary, err: "" };
      } catch (e) {
        err = e instanceof Error ? e.message : "ତ୍ରୁଟି ହେଲା।";
        if (attempt < 3) await new Promise((r) => setTimeout(r, 4000 * attempt));
      }
    }
    return { text: null, err };
  }

  async function handleBulk(items: FormValues[]) {
    setBusy(true);
    cancelRef.current = false;
    let acc = unitsRef.current;
    let done = 0;
    let failed = 0;
    setProgress({ done, total: items.length, failed });
    for (let i = 0; i < items.length && !cancelRef.current; i += 3) {
      const chunk = items.slice(i, i + 3);
      const results = await Promise.all(chunk.map(generateWithRetry));
      const fresh: TikaUnit[] = results.flatMap((r, k) =>
        r.text ? [{ id: crypto.randomUUID(), ...chunk[k]!, language: languageId, commentary: r.text, createdAt: Date.now() }] : [],
      );
      done += chunk.length;
      failed += chunk.length - fresh.length;
      acc = [...acc, ...fresh];
      persist(acc);
      if (fresh.length) setActiveId(fresh[fresh.length - 1]!.id);
      setProgress({ done, total: items.length, failed });
      if (fresh.length === 0) {
        toast.error(results[0]?.err ?? "ତ୍ରୁଟି ହେଲା।");
        break;
      }
    }
    toast.success(`${done - failed} ଟୀକା ଗ୍ରନ୍ଥରେ ଯୋଡ଼ାଗଲା${failed ? ` (${failed} ବିଫଳ)` : ""}।`);
    setProgress(null);
    setBusy(false);
  }

  function download(name: string, text: string, mime: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleMarkdown() {
    const md = units.map((u) => `## ${u.reference}\n\n${u.verse.split("\n").map((l) => `> ${l}`).join("\n")}\n\n${u.commentary.replace(/^\s*●\s*$/gm, "\n---\n")}`).join("\n\n---\n\n");
    download("sloka-commentary.md", md, "text/markdown");
  }

  function handleBackup() {
    download(`sloka-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(units), "application/json");
  }

  async function handleRestore(file: File) {
    try {
      const data = JSON.parse(await file.text()) as TikaUnit[];
      if (!Array.isArray(data) || data.some((u) => !u || typeof u.verse !== "string" || typeof u.commentary !== "string")) throw new Error();
      const have = new Set(unitsRef.current.map((u) => u.id));
      const merged = [...unitsRef.current, ...data.filter((u) => !have.has(u.id))];
      persist(merged);
      toast.success(`${merged.length - have.size} ଏକକ ପୁନଃସ୍ଥାପିତ`);
    } catch {
      toast.error("ବ୍ୟାକଅପ୍ ଫାଇଲ୍ ବୈଧ ନୁହେଁ।");
    }
  }

  function step(dir: -1 | 1) {
    const i = units.findIndex((u) => u.id === activeId);
    const next = units[i + dir];
    if (next) setActiveId(next.id);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function handleExport() {
    if (units.length === 0) {
      toast.error("ରପ୍ତାନି ପାଇଁ କୌଣସି ଏକକ ନାହିଁ।");
      return;
    }
    await exportBookDocx(units);
  }

  return (
    <div className="min-h-screen">
      <Aurora />
      <header className="hero-bar sticky top-0 z-20 text-white">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden size-11 items-center justify-center rounded-full border border-white/50 bg-white/10 text-amber-200 shadow-[0_0_24px_#fbbf24aa] backdrop-blur sm:flex">
              <Flower2 className="spin-slow size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-interface text-[0.65rem] font-semibold uppercase tracking-widest text-amber-200">Sloka Commentary · Manuscript Editor</p>
              <h1 className="shimmer-text font-display text-3xl sm:text-4xl">
                <span className="font-deva">श्लोक</span> <span>—</span>{" "}
              <span className="font-odia">ଓଡ଼ିଆ ଟୀକା</span>
              </h1>
            </div>
          </div>
          <Button
            onClick={handleExport}
            variant="secondary"
            className="glow-btn border-0 font-interface font-semibold text-white"
          >
            <Download aria-hidden="true" />
            DOCX ରୂପେ ରପ୍ତାନି
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] gap-6 p-4 sm:p-6 lg:grid-cols-[23rem_1fr]">
        <aside className="glow-card manuscript-settle space-y-8 rounded-3xl px-5 py-7 sm:px-6">
          <div className="flex items-center gap-3 border-b-2 border-fuchsia-300 pb-3">
            <span className="pulse-glow size-3 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500" />
            <h2 className="font-display text-2xl text-fuchsia-800">ନୂତନ ଟୀକା ଏକକ</h2>
          </div>
          <div>
            <label htmlFor="model" className="mb-1.5 block font-interface text-[0.72rem] font-semibold uppercase text-fuchsia-800">AI ମଡେଲ୍</label>
            <select
              id="model"
              value={modelId}
              disabled={busy}
              onChange={(e) => { setModelId(e.target.value); saveModelId(e.target.value); }}
              className="glow-field w-full rounded-xl border border-fuchsia-200 bg-white/80 px-3 py-2.5 font-interface text-[0.9rem] outline-none"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="language" className="mb-1.5 block font-interface text-[0.72rem] font-semibold uppercase text-fuchsia-800">ଟୀକାର ଭାଷା · Commentary language</label>
            <select
              id="language"
              value={languageId}
              disabled={busy}
              onChange={(e) => { setLanguageId(e.target.value); saveLanguageId(e.target.value); }}
              className="glow-field w-full rounded-xl border border-fuchsia-200 bg-white/80 px-3 py-2.5 font-interface text-[0.9rem] outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.native}{l.native !== l.english ? ` · ${l.english}` : ""}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/60 p-1 font-interface text-sm font-semibold">
            {([["single", "ଏକ ଶ୍ଲୋକ"], ["bulk", "ବହୁ · DOCX"], ["gita", "ଗୀତା"]] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                disabled={busy}
                onClick={() => setMode(k)}
                className={`rounded-xl px-2 py-2 transition ${mode === k ? "glow-btn text-white" : "text-fuchsia-900 hover:bg-white/80"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "single" ? (
            <VerseForm busy={busy} onSubmit={handleSubmit} />
          ) : mode === "gita" ? (
            <GitaPanel busy={busy} progress={progress} onStart={handleBulk} onCancel={() => { cancelRef.current = true; }} />
          ) : (
            <BulkPanel busy={busy} progress={progress} onStart={handleBulk} onCancel={() => { cancelRef.current = true; }} />
          )}
          <div className="border-t-2 border-dashed border-cyan-400/60 pt-6">
            <BookSidebar
              units={units}
              activeId={activeId}
              onSelect={setActiveId}
              onMove={(i, dir) => persist(move(units, i, i + dir))}
              onDelete={(id) => {
                const next = units.filter((u) => u.id !== id);
                persist(next);
                if (activeId === id) setActiveId(next[next.length - 1]?.id ?? null);
              }}
            onMarkdown={handleMarkdown}
              onBackup={handleBackup}
              onRestore={handleRestore}
            />
          </div>
        </aside>

        <main className="glow-card manuscript-settle relative min-h-[calc(100vh-9rem)] overflow-hidden rounded-3xl">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400" />
          <CommentaryPanel unit={active} busy={busy} onRegenerate={handleRegenerate} onPrev={() => step(-1)} onNext={() => step(1)} />
        </main>
      </div>
    </div>
  );
}
