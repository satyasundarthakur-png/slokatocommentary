import { parseCommentary, type TikaUnit } from "@/lib/book";

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
      <div className="flex min-h-[60vh] items-center justify-center px-8 text-center">
        <p className="max-w-md leading-loose text-muted-foreground">
          ବାମ ପାର୍ଶ୍ୱରେ ମୂଳ ସଂସ୍କୃତ ଶ୍ଲୋକ ଓ ତାହାର ସନ୍ଦର୍ଭ ଲେଖି ଟୀକା ରଚନା ଆରମ୍ଭ କରନ୍ତୁ। ପ୍ରତ୍ୟେକ ଟୀକା ଆପଣଙ୍କ
          ଗ୍ରନ୍ଥରେ ଏକ ନୂତନ ଏକକ ରୂପେ ସଂଯୁକ୍ତ ହେବ।
        </p>
      </div>
    );
  }

  const blocks = parseCommentary(unit.commentary);

  return (
    <article className="mx-auto max-w-3xl px-8 py-12 sm:px-14">
      <header className="border-b border-border pb-8">
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
        <p className="mt-3 text-right text-sm italic text-rubric">{unit.reference}</p>
      </header>

      <div className="mt-10">
        {blocks.map((b, i) =>
          b.type === "sep" ? (
            <p key={i} className="my-8 text-center text-lg text-rubric/70">
              ●
            </p>
          ) : (
            <p key={i} className="tika-prose mb-5 indent-8 text-ink">
              {b.text}
            </p>
          ),
        )}
      </div>

      <footer className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm text-muted-foreground">
        <span>{new Date(unit.createdAt).toLocaleString("en-IN")}</span>
        <button
          onClick={onRegenerate}
          disabled={busy}
          className="rounded-sm border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:opacity-50"
        >
          {busy ? "ପୁନଃ ରଚନା…" : "ଏହି ଏକକ ପୁନଃ ରଚନା କରନ୍ତୁ"}
        </button>
      </footer>
    </article>
  );
}
