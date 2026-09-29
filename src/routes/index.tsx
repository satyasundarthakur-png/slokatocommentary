import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Flower2 } from "lucide-react";
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
    <div className="min-h-screen border-t-4 border-marigold">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden size-11 items-center justify-center border border-marigold/60 text-marigold sm:flex">
              <Flower2 className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-interface text-[0.65rem] font-semibold uppercase text-marigold">Sloka Commentary · Manuscript Editor</p>
              <h1 className="font-display text-2xl sm:text-3xl">
                <span className="font-deva">श्लोक</span> <span className="text-marigold">—</span>{" "}
              <span className="font-odia">ଓଡ଼ିଆ ଟୀକା</span>
              </h1>
            </div>
          </div>
          <Button
            onClick={handleExport}
            variant="secondary"
            className="border border-marigold/60 bg-marigold font-interface font-semibold text-ink shadow-none hover:bg-accent"
          >
            <Download aria-hidden="true" />
            DOCX ରୂପେ ରପ୍ତାନି
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] gap-0 border-x border-border bg-card shadow-xl lg:grid-cols-[23rem_1fr]">
        <aside className="space-y-8 border-b border-sidebar-border bg-sidebar px-5 py-7 lg:min-h-[calc(100vh-93px)] lg:border-b-0 lg:border-r sm:px-6">
          <div className="flex items-center gap-3 border-b-2 border-marigold pb-3">
            <span className="size-2 bg-teal" />
            <h2 className="font-display text-xl text-rubric">ନୂତନ ଟୀକା ଏକକ</h2>
          </div>
          <VerseForm busy={busy} onSubmit={handleSubmit} />
          <div className="border-t-2 border-teal/40 pt-6">
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

        <main className="manuscript-settle relative min-h-[calc(100vh-93px)] overflow-hidden bg-card">
          <div className="absolute inset-x-0 top-0 h-2 bg-teal" />
          <CommentaryPanel unit={active} busy={busy} onRegenerate={handleRegenerate} />
        </main>
      </div>
    </div>
  );
}
