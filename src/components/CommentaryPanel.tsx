import { parseCommentary, type TikaUnit } from "@/lib/book";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";

export function CommentaryPanel({
  unit,
  busy,
  onRegenerate,
}: {
  unit: TikaUnit | null;
  busy: boolean;
  onRegenerate: () => void;
}) {
  if (!unit) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-8 text-center">
        <div className="max-w-lg">
          <Sparkles className="mx-auto mb-6 size-9 text-marigold" aria-hidden="true" />
          <div className="mx-auto mb-7 flex items-center justify-center gap-3 text-rubric">
            <span className="h-px w-16 bg-border" /><span className="text-lg">●</span><span className="h-px w-16 bg-border" />
          </div>
          <p className="font-display text-3xl text-rubric">ଟୀକା ପୃଷ୍ଠା</p>
          <p className="mt-4 leading-loose text-muted-foreground">
            ବାମ ପାର୍ଶ୍ୱରେ ମୂଳ ସଂସ୍କୃତ ଶ୍ଲୋକ ଓ ତାହାର ସନ୍ଦର୍ଭ ଲେଖି ଟୀକା ରଚନା ଆରମ୍ଭ କରନ୍ତୁ। ପ୍ରତ୍ୟେକ ଟୀକା ଆପଣଙ୍କ ଗ୍ରନ୍ଥରେ ଏକ ନୂତନ ଏକକ ରୂପେ ସଂଯୁକ୍ତ ହେବ।
          </p>
        </div>
      </div>
    );
  }

  const blocks = parseCommentary(unit.commentary);

  return (
    <article className="mx-auto max-w-4xl px-7 py-14 sm:px-14 lg:px-20">
      <header className="border-b-2 border-marigold pb-8">
        <p className="mb-6 text-center font-interface text-[0.7rem] font-bold uppercase text-teal">ମୂଳ ଶ୍ଲୋକ</p>
        {unit.verse
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line, i) => (
            <p
              key={i}
              className="font-deva text-center text-[1.2rem] leading-[2] text-ink"
            >
              {line}
            </p>
          ))}
        <p className="mt-4 text-right text-sm italic text-rubric">— {unit.reference}</p>
      </header>

      <div className="mt-10">
        {blocks.map((b, i) =>
          b.type === "sep" ? (
            <div key={i} className="my-8 flex items-center justify-center gap-3 text-marigold">
              <span className="h-px w-10 bg-border" /><span className="text-lg">●</span><span className="h-px w-10 bg-border" />
            </div>
          ) : (
            <p key={i} className="tika-prose mb-5 indent-8 text-ink">
              {b.text}
            </p>
          ),
        )}
      </div>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-teal/40 pt-6 text-sm text-muted-foreground">
        <span>{new Date(unit.createdAt).toLocaleString("en-IN")}</span>
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={busy}
          className="rounded-sm border-teal text-teal hover:bg-teal hover:text-secondary-foreground"
        >
          <RefreshCw aria-hidden="true" />
          {busy ? "ପୁନଃ ରଚନା…" : "ଏହି ଏକକ ପୁନଃ ରଚନା କରନ୍ତୁ"}
        </Button>
      </footer>
    </article>
  );
}
