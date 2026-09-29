import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TIKA_SYSTEM_PROMPT } from "./tikaSystemPrompt";
import { DEFAULT_LANGUAGE_ID, LANGUAGE_IDS, getLanguage } from "./languages";
import { DEFAULT_MODEL_ID, MODELS, MODEL_IDS } from "./models";

const LengthEnum = z.enum(["short", "medium", "long"]);

const TikaInput = z.object({
  verse: z.string().trim().min(1).max(4000),
  reference: z.string().trim().min(1).max(300),
  supportingTexts: z.string().trim().max(4000).optional().default(""),
  length: LengthEnum.optional().default("medium"),
  topic: z.string().trim().max(300).optional().default(""),
  modelId: z.enum(MODEL_IDS).optional().default(DEFAULT_MODEL_ID),
  language: z.enum(LANGUAGE_IDS).optional().default(DEFAULT_LANGUAGE_ID),
  apiKey: z.string().trim().max(300).optional().default(""),
});

type TikaInput = z.infer<typeof TikaInput>;

const LENGTH_LABEL: Record<z.infer<typeof LengthEnum>, string> = {
  short: "ସଂକ୍ଷିପ୍ତ (~250-350 ଶବ୍ଦ)",
  medium: "ମଧ୍ୟମ (~400-700 ଶବ୍ଦ)",
  long: "ଦୀର୍ଘ (~900-1200 ଶବ୍ଦ)",
};

function buildUserMessage(d: TikaInput) {
  const lines = [`ଶ୍ଲୋକ:\n${d.verse}`, `ସନ୍ଦର୍ଭ: ${d.reference}`];
  if (d.supportingTexts) lines.push(`ସହାୟକ ଗ୍ରନ୍ଥ: ${d.supportingTexts}`);
  lines.push(`ଦୀର୍ଘତା: ${LENGTH_LABEL[d.length]}`);
  if (d.topic) lines.push(`ବିଷୟ: ${d.topic}`);
  return lines.join("\n\n");
}

/** The Odia style guide stays untouched; other languages get an output override appended. */
function buildSystemPrompt(languageId: string) {
  const lang = getLanguage(languageId);
  if (lang.id === "or") return TIKA_SYSTEM_PROMPT;
  const script =
    lang.id === "en"
      ? "Roman script"
      : `${lang.english} in its native script (${lang.native})`;
  return `${TIKA_SYSTEM_PROMPT}

OUTPUT LANGUAGE OVERRIDE (highest priority): Write the ENTIRE commentary in ${lang.english}, using ${script}. Do not write in Odia. Keep exactly the same structure, unit segmentation, "●" separators, tone, depth and requested length described in the style guide above — treat its Odia wording only as a model of register, and reproduce that same traditional, reverent commentary register naturally in ${lang.english}. Quote Sanskrit terms and the verse itself in Devanagari as needed. Output only the commentary, with no notes about translation or language.`;
}

const cleanOutput = (t: string) => t.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

const fail = (status: number, provider: string, detail: string): never => {
  console.error(`${provider} error`, status, detail.slice(0, 500));
  if (status === 429) throw new Error("ଅତ୍ୟଧିକ ଅନୁରୋଧ — କିଛି ସମୟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।");
  if (status === 401 || status === 403) throw new Error("API କି ଅବୈଧ।");
  throw new Error("ଟୀକା ପ୍ରସ୍ତୁତ କରିବାରେ ତ୍ରୁଟି ହେଲା।");
};

async function callGroq(model: string, system: string, userMessage: string, userKey: string) {
  const apiKey = userKey || process.env["GROQ_API_KEY"];
  if (!apiKey) throw new Error("Groq API କି ନାହିଁ — ମଡେଲ୍ ତଳେ ଆପଣଙ୍କ Groq API key ଯୋଡ଼ନ୍ତୁ।");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) fail(res.status, "Groq", await res.text().catch(() => ""));
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

async function callGemini(model: string, system: string, userMessage: string, userKey: string) {
  const apiKey = userKey || process.env["GEMINI_API_KEY"];
  if (!apiKey) throw new Error("Gemini API କି ନାହିଁ — ମଡେଲ୍ ତଳେ ଆପଣଙ୍କ Gemini API key ଯୋଡ଼ନ୍ତୁ।");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    },
  );
  if (!res.ok) fail(res.status, "Gemini", await res.text().catch(() => ""));
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
}

export const generateTika = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TikaInput.parse(input))
  .handler(async ({ data }) => {
    const opt = MODELS.find((m) => m.id === data.modelId) ?? MODELS[0]!;
    const userMessage = buildUserMessage(data);
    const system = buildSystemPrompt(data.language);
    const raw =
      opt.provider === "gemini"
        ? await callGemini(opt.model, system, userMessage, data.apiKey)
        : await callGroq(opt.model, system, userMessage, data.apiKey);
    const text = cleanOutput(raw);
    if (!text) throw new Error("ମଡେଲରୁ ଖାଲି ଉତ୍ତର ମିଳିଲା।");
    return { commentary: text };
  });
