// Devanagari → IAST (dependency-free; standard scheme).
const IND: Record<string, string> = { अ: "a", आ: "ā", इ: "i", ई: "ī", उ: "u", ऊ: "ū", ऋ: "ṛ", ॠ: "ṝ", ऌ: "ḷ", ए: "e", ऐ: "ai", ओ: "o", औ: "au" };
const MAT: Record<string, string> = { "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ", "े": "e", "ै": "ai", "ो": "o", "ौ": "au" };
const CON: Record<string, string> = { क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ṅ", च: "c", छ: "ch", ज: "j", झ: "jh", ञ: "ñ", ट: "ṭ", ठ: "ṭh", ड: "ḍ", ढ: "ḍh", ण: "ṇ", त: "t", थ: "th", द: "d", ध: "dh", न: "n", प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", व: "v", श: "ś", ष: "ṣ", स: "s", ह: "h", ळ: "ḻ" };
const MISC: Record<string, string> = { "ं": "ṃ", "ः": "ḥ", "ँ": "m̐", "ऽ": "'", "।": ".", "॥": "||", "ॐ": "oṃ" };

export function devaToIast(text: string): string {
  let out = "";
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    if (CON[c]) {
      out += CON[c];
      const n = chars[i + 1];
      if (n === "़") i++;
      const m = chars[i + 1];
      if (m && MAT[m]) { out += MAT[m]; i++; }
      else if (m === "्") i++;
      else out += "a";
    } else if (IND[c]) out += IND[c];
    else if (MISC[c]) out += MISC[c];
    else if (c >= "०" && c <= "९") out += String(c.charCodeAt(0) - 0x0966);
    else out += c;
  }
  return out;
}
