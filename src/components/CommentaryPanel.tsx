import { parseCommentary, type TikaUnit } from "@/lib/book";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Minus, Plus, RefreshCw, Sparkles, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { devaToIast } from "@/lib/translit";

const SPEECH: Record<string, string> = { or: "or-IN", hi: "hi-IN", en: "en-IN", sa: "hi-IN", mr: "mr-IN", bn: "bn-IN", as: "as-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", ml: "ml-IN", gu: "gu-IN", pa: "pa-IN" };

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast.error("ଏହି ବ୍ରାଉଜର୍ ଶୁଣାଇବା ସମର୍ଥନ କରେ ନାହିଁ।");
    return;
  }
  window.speechSynthesis.cancel();
  const voices = window.speechSynthesis.getVoices();
  if (voices.length && !voices.some((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))) {
    toast.error(`ଏହି ଡିଭାଇସ୍‌ରେ ${lang} ସ୍ୱର ନାହିଁ।`);
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function CommentaryPanel({
  unit,
  busy,
  onRegenerate,
  onPrev,
  onNext,
}: {
  unit: TikaUnit | null;
  busy: boolean;
  onRegenerate: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [scale, setScale] = useState(1);
  useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, [unit?.id]);
  if (!unit) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-8 text-center">
        <div className="max-w-lg">
          <Sparkles className="pulse-glow mx-auto mb-6 size-12 text-amber-500" aria-hidden="true" />
          <div className="mx-auto mb-7 flex items-center justify-center gap-3 text-rubric">
            <span className="h-px w-16 bg-border" /><span className="sep-dot text-lg">●</span><span className="h-px w-16 bg-border" />
          </div>
          <p className="font-display text-4xl text-fuchsia-800">ଟୀକା ପୃଷ୍ଠା</p>
          <p className="mt-4 leading-loose text-muted-foreground">
            ବାମ ପାର୍ଶ୍ୱରେ ମୂଳ ସଂସ୍କୃତ ଶ୍ଲୋକ ଓ ତାହାର ସନ୍ଦର୍ଭ ଲେଖି ଟୀକା ରଚନା ଆରମ୍ଭ କରନ୍ତୁ। ପ୍ରତ୍ୟେକ ଟୀକା ଆପଣଙ୍କ ଗ୍ରନ୍ଥରେ ଏକ ନୂତନ ଏକକ ରୂପେ ସଂଯୁକ୍ତ ହେବ।
          </p>
        </div>
      </div>
    );
  }

  const blocks = parseCommentary(unit.commentary);
  const plain = blocks.filter((b) => b.type !== "sep").map((b) => ("text" in b ? b.text : "")).join("\n\n");
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(`${unit.verse}\n— ${unit.reference}\n\n${plain}`);
      toast.success("କପି ହେଲା।");
    } catch {
      toast.error("କପି ହେଲା ନାହିଁ।");
    }
  };
  const chip = "glow-row inline-flex items-center gap-1 rounded-full border border-fuchsia-200 bg-white/80 px-3 py-1.5 font-interface text-xs font-semibold text-fuchsia-900";

  return (
    <article className="mx-auto max-w-4xl px-7 py-14 sm:px-14 lg:px-20">
      <header className="border-b-2 border-dashed border-fuchsia-300 pb-8">
        <p className="mb-6 text-center font-interface text-[0.7rem] font-bold uppercase text-cyan-700">ମୂଳ ଶ୍ଲୋକ</p>
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
        <p className="mt-4 text-center font-interface text-sm italic leading-relaxed text-cyan-800/90">
          {devaToIast(unit.verse.replace(/\n/g, "  "))}
        </p>
        <p className="mt-4 text-right text-sm italic text-fuchsia-700">— {unit.reference}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button type="button" className={chip} onClick={onPrev} aria-label="ପୂର୍ବ"><ChevronLeft className="size-4" />ପୂର୍ବ</button>
          <button type="button" className={chip} onClick={() => speak(unit.verse, "hi-IN")}><Volume2 className="size-4" />ଶ୍ଲୋକ</button>
          <button type="button" className={chip} onClick={() => speak(plain, SPEECH[unit.language ?? "or"] ?? "or-IN")}><Volume2 className="size-4" />ଟୀକା</button>
          <button type="button" className={chip} onClick={() => window.speechSynthesis?.cancel()} aria-label="ବନ୍ଦ"><VolumeX className="size-4" /></button>
          <button type="button" className={chip} onClick={copyAll}><Copy className="size-4" />କପି</button>
          <button type="button" className={chip} onClick={() => setScale((s) => Math.max(0.85, s - 0.1))} aria-label="ଛୋଟ"><Minus className="size-4" /></button>
          <button type="button" className={chip} onClick={() => setScale((s) => Math.min(1.5, s + 0.1))} aria-label="ବଡ଼"><Plus className="size-4" /></button>
          <button type="button" className={chip} onClick={onNext} aria-label="ପରବର୍ତ୍ତୀ">ପରବର୍ତ୍ତୀ<ChevronRight className="size-4" /></button>
        </div>
      </header>

      <div className="mt-10" style={{ fontSize: `${scale}em` }}>
        {blocks.map((b, i) =>
          b.type === "sep" ? (
            <div key={i} className="my-8 flex items-center justify-center gap-3 text-marigold">
              <span className="h-px w-10 bg-border" /><span className="sep-dot text-lg">●</span><span className="h-px w-10 bg-border" />
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
          className="glow-btn rounded-xl text-white"
        >
          <RefreshCw aria-hidden="true" />
          {busy ? "ପୁନଃ ରଚନା…" : "ଏହି ଏକକ ପୁନଃ ରଚନା କରନ୍ତୁ"}
        </Button>
      </footer>
    </article>
  );
}
