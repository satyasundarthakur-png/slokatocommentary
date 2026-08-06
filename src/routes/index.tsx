import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookSidebar } from "@/components/BookSidebar";
import { CommentaryPanel } from "@/components/CommentaryPanel";
import { VerseForm, type FormValues } from "@/components/VerseForm";
import { loadBook, move, saveBook, type TikaUnit } from "@/lib/book";
import { exportBookDocx } from "@/lib/docxExport";
import { generateTika } from "@/lib/tika.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AshtavakraTika — ଅଷ୍ଟାବକ୍ରଗୀତା ଓଡ଼ିଆ ଟୀକା" },
      {
        name: "description",
        content:
          "Compose Odia Vedantic commentary on Sanskrit verses, verse by verse, and export the whole book as a print-ready DOCX.",
      },
      { property: "og:title", content: "AshtavakraTika — ଅଷ୍ଟାବକ୍ରଗୀତା ଓଡ଼ିଆ ଟୀକା" },
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
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <h1 className="font-deva text-2xl tracking-tight text-ink">
              अष्टावक्रगीता <span className="text-rubric">—</span>{" "}
              <span className="font-odia">ଓଡ଼ିଆ ଟୀକା</span>
            </h1>
            <p className="mt-1 text-[0.8rem] tracking-wide text-muted-foreground">
              ପାରମ୍ପରିକ ବେଦାନ୍ତ ଟୀକା ସଙ୍କଳନ
            </p>
          </div>
          <button
            onClick={handleExport}
            className="rounded-sm border border-border bg-background px-4 py-2 text-sm tracking-wide text-foreground transition-colors hover:bg-accent"
          >
            DOCX ରୂପେ ରପ୍ତାନି
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[22rem_1fr]">
        <aside className="space-y-8 border-b border-border bg-sidebar/60 px-6 py-8 lg:min-h-[calc(100vh-89px)] lg:border-b-0 lg:border-r">
          <VerseForm busy={busy} onSubmit={handleSubmit} />
          <div className="border-t border-border pt-6">
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

        <main className="bg-card/40">
          <CommentaryPanel unit={active} busy={busy} onRegenerate={handleRegenerate} />
        </main>
      </div>
    </div>
  );
}
