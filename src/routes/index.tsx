import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
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
  const generate = useServerFn(generateTika);

  useEffect(() => {
    const stored = loadBook();
    setUnits(stored);
    setActiveId(stored[stored.length - 1]?.id ?? null);
  }, []);

  const active = useMemo(
    () => units.find((u) => u.id === activeId) ?? null,
    [units, activeId],
  );

  function persist(next: TikaUnit[]) {
    setUnits(next);
    saveBook(next);
  }

  async function handleSubmit(values: FormValues) {
    setBusy(true);
    try {
      const { commentary } = await generate({ data: values });
      const unit: TikaUnit = {
        id: crypto.randomUUID(),
        ...values,
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
          <VerseForm busy={busy} onSubmit={handleSubmit} />
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
            />
          </div>
        </aside>

        <main className="glow-card manuscript-settle relative min-h-[calc(100vh-9rem)] overflow-hidden rounded-3xl">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400" />
          <CommentaryPanel unit={active} busy={busy} onRegenerate={handleRegenerate} />
        </main>
      </div>
    </div>
  );
}
