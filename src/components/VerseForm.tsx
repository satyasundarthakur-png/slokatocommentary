import { useState } from "react";
import type { TikaLength } from "@/lib/book";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export interface FormValues {
  verse: string;
  reference: string;
  supportingTexts: string;
  topic: string;
  length: TikaLength;
}

const EMPTY: FormValues = {
  verse: "",
  reference: "",
  supportingTexts: "",
  topic: "",
  length: "medium",
};

/** A verse must contain actual Devanagari text, not just a number reference. */
export function hasSanskritText(v: string) {
  const deva = v.match(/[\u0900-\u097F]/g);
  return (deva?.length ?? 0) >= 8;
}

const fieldCls =
  "w-full rounded-sm border border-sidebar-border bg-card/80 px-3 py-2.5 text-[0.95rem] text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-teal focus:ring-2 focus:ring-teal/20";

const labelCls = "mb-1.5 block font-interface text-[0.72rem] font-semibold uppercase text-rubric";

export function VerseForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (values: FormValues) => void;
}) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const verse = values.verse.trim();
    const reference = values.reference.trim();
    if (!verse || !reference) {
      setError("ମୂଳ ଶ୍ଲୋକ ଓ ସନ୍ଦର୍ଭ ଦୁହେଁ ଆବଶ୍ୟକ।");
      return;
    }
    if (!hasSanskritText(verse)) {
      setError(
        "କେବଳ ଶ୍ଲୋକ ସଂଖ୍ୟା ଦିଆଯାଇଛି। ଟୀକା ପାଇଁ ଦୟାକରି ପ୍ରକୃତ ସଂସ୍କୃତ ଶ୍ଲୋକର ପାଠ (ଦେବନାଗରୀ ଲିପିରେ) ଏଠାରେ ଲେଖନ୍ତୁ — ଆପ୍ ଶ୍ଲୋକ ରଚନା କରିବ ନାହିଁ।",
      );
      return;
    }
    setError(null);
    onSubmit({ ...values, verse, reference });
  }

  return (
    <form onSubmit={submit} className="space-y-4 font-odia">
      <div>
        <label className={labelCls} htmlFor="verse">
          ମୂଳ ଶ୍ଲୋକ (ସଂସ୍କୃତ) *
        </label>
        <textarea
          id="verse"
          rows={4}
          value={values.verse}
          onChange={(e) => set("verse", e.target.value)}
          placeholder={"यथा प्रकाशयाम्येकः ..."}
          className={`${fieldCls} font-deva leading-loose`}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="reference">
          ସନ୍ଦର୍ଭ * (ଅଧ୍ୟାୟ.ଶ୍ଲୋକ + ଗ୍ରନ୍ଥ ନାମ)
        </label>
        <input
          id="reference"
          value={values.reference}
          onChange={(e) => set("reference", e.target.value)}
          placeholder="୨.୮ — ଅଷ୍ଟାବକ୍ରଗୀତା"
          className={fieldCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="supporting">
          ସହାୟକ ଗ୍ରନ୍ଥ (କମା ଦେଇ ଅଲଗା)
        </label>
        <input
          id="supporting"
          value={values.supportingTexts}
          onChange={(e) => set("supportingTexts", e.target.value)}
          placeholder="ମାଣ୍ଡୂକ୍ୟ କାରିକା, ବିବେକଚୂଡ଼ାମଣି"
          className={fieldCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="length">
            ଦୀର୍ଘତା
          </label>
          <select
            id="length"
            value={values.length}
            onChange={(e) => set("length", e.target.value as TikaLength)}
            className={fieldCls}
          >
            <option value="short">ସଂକ୍ଷିପ୍ତ</option>
            <option value="medium">ମଧ୍ୟମ (~୪୦୦-୭୦୦)</option>
            <option value="long">ଦୀର୍ଘ</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="topic">
            ବିଷୟ
          </label>
          <input
            id="topic"
            value={values.topic}
            onChange={(e) => set("topic", e.target.value)}
            placeholder="ସାକ୍ଷୀଭାବ"
            className={fieldCls}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-sm border-l-4 border-destructive bg-card px-3 py-2 text-sm leading-relaxed text-destructive shadow-sm">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={busy}
        className="h-11 w-full rounded-sm border-b-4 border-marigold bg-primary font-interface text-[0.9rem] font-semibold text-primary-foreground shadow-md hover:bg-teal"
      >
        <Sparkles aria-hidden="true" />
        {busy ? "ଟୀକା ପ୍ରସ୍ତୁତ ହେଉଛି…" : "ଟୀକା ରଚନା କରନ୍ତୁ"}
      </Button>
    </form>
  );
}
