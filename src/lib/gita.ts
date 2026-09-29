// Bhagavad Gita verse source: vedicscriptures API (MIT-licensed code, free for
// non-monetized use) — https://github.com/vedicscriptures/vedicscriptures.github.io
export const GITA_VERSES = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];

interface Acharya { author?: string; sc?: string }
interface GitaSlok {
  chapter: number;
  verse: number;
  slok: string;
  sankar?: Acharya; raman?: Acharya; ms?: Acharya; srid?: Acharya;
}

const toDeva = (n: number | string) => String(n).replace(/\d/g, (d) => String.fromCharCode(0x0966 + Number(d)));

/** Normalise "…|" / "||१-१||" of the API to "…।" / "॥ १.१ ॥". */
function cleanVerse(s: string, ch: number, v: number) {
  return s
    .replace(/\|\|[^|]*\|\|\s*$/, `॥ ${toDeva(ch)}.${toDeva(v)} ॥`)
    .replace(/\s*\|\s*/g, " । ")
    .replace(/ । \n/g, " ।\n")
    .replace(/ । $/, " ।")
    .trim();
}

const NAMES: [keyof GitaSlok, string][] = [["sankar", "श्रीशङ्कराचार्यः"], ["raman", "श्रीरामानुजाचार्यः"], ["ms", "श्रीमधुसूदनसरस्वती"], ["srid", "श्रीधरस्वामी"]];

export async function fetchGitaVerse(ch: number, v: number, withAcharyas: boolean) {
  const res = await fetch(`https://vedicscriptures.github.io/slok/${ch}/${v}`);
  if (!res.ok) throw new Error(`${ch}.${v}`);
  const d = (await res.json()) as GitaSlok;
  let supporting = "";
  if (withAcharyas) {
    supporting = NAMES.map(([k, label]) => {
      const t = ((d[k] as Acharya | undefined)?.sc ?? "").replace(/^।।[\d.]+।।/, "").trim();
      return t && !/did not comment/i.test(t) ? `${label}: ${t.slice(0, 700)}` : "";
    })
      .filter(Boolean)
      .join("\n");
  }
  return { verse: cleanVerse(d.slok, ch, v), supporting: supporting.slice(0, 3500) };
}
