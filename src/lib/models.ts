export type Provider = "groq" | "gemini";

export interface ModelOption {
  id: string;
  provider: Provider;
  model: string;
  label: string;
}

/** Selectable AI models. The first entry is the default. */
export const MODELS: ModelOption[] = [
  { id: "groq:qwen/qwen3.8-27b", provider: "groq", model: "qwen/qwen3.8-27b", label: "Groq · Qwen3.8 27B (latest)" },
  { id: "groq:openai/gpt-oss-120b", provider: "groq", model: "openai/gpt-oss-120b", label: "Groq · GPT-OSS 120B" },
  { id: "gemini:gemini-2.5-flash", provider: "gemini", model: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini:gemini-2.5-flash-lite", provider: "gemini", model: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
];

export const DEFAULT_MODEL_ID = MODELS[0]!.id;
export const MODEL_IDS = MODELS.map((m) => m.id) as [string, ...string[]];

const KEY = "sloka-model-v1";

export function loadModelId(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL_ID;
  const v = window.localStorage.getItem(KEY);
  return v && MODEL_IDS.includes(v) ? v : DEFAULT_MODEL_ID;
}

export function saveModelId(id: string) {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}

/* ---------- User-supplied API keys (stored only in this browser) ---------- */

export const PROVIDER_INFO: Record<Provider, { name: string; keyUrl: string; placeholder: string }> = {
  groq: { name: "Groq", keyUrl: "https://console.groq.com/keys", placeholder: "gsk_..." },
  gemini: { name: "Google Gemini", keyUrl: "https://aistudio.google.com/apikey", placeholder: "AIza..." },
};

const KEYS_STORAGE = "sloka-api-keys-v1";

export function loadApiKeys(): Partial<Record<Provider, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEYS_STORAGE);
    return raw ? (JSON.parse(raw) as Partial<Record<Provider, string>>) : {};
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: Partial<Record<Provider, string>>) {
  try {
    window.localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys));
  } catch {
    /* ignore */
  }
}

export function providerOf(modelId: string): Provider {
  return (MODELS.find((m) => m.id === modelId) ?? MODELS[0]!).provider;
}
