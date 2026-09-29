import { readChoice, writePref } from "./storage";

interface Language {
  id: string;
  english: string;
  native: string;
  /** Font used for this language in the exported DOCX. */
  docxFont: string;
}

/** Commentary output languages. The first entry (Odia) is the default. */
export const LANGUAGES: Language[] = [
  { id: "or", english: "Odia", native: "ଓଡ଼ିଆ", docxFont: "Noto Sans Oriya" },
  { id: "hi", english: "Hindi", native: "हिन्दी", docxFont: "Noto Sans Devanagari" },
  { id: "en", english: "English", native: "English", docxFont: "Georgia" },
  { id: "sa", english: "Sanskrit", native: "संस्कृतम्", docxFont: "Noto Sans Devanagari" },
  { id: "mr", english: "Marathi", native: "मराठी", docxFont: "Noto Sans Devanagari" },
  { id: "bn", english: "Bengali", native: "বাংলা", docxFont: "Noto Sans Bengali" },
  { id: "as", english: "Assamese", native: "অসমীয়া", docxFont: "Noto Sans Bengali" },
  { id: "te", english: "Telugu", native: "తెలుగు", docxFont: "Noto Sans Telugu" },
  { id: "ta", english: "Tamil", native: "தமிழ்", docxFont: "Noto Sans Tamil" },
  { id: "kn", english: "Kannada", native: "ಕನ್ನಡ", docxFont: "Noto Sans Kannada" },
  { id: "ml", english: "Malayalam", native: "മലയാളം", docxFont: "Noto Sans Malayalam" },
  { id: "gu", english: "Gujarati", native: "ગુજરાતી", docxFont: "Noto Sans Gujarati" },
  { id: "pa", english: "Punjabi", native: "ਪੰਜਾਬੀ", docxFont: "Noto Sans Gurmukhi" },
];

export const DEFAULT_LANGUAGE_ID = LANGUAGES[0]!.id;
export const LANGUAGE_IDS = LANGUAGES.map((l) => l.id) as [string, ...string[]];

export const getLanguage = (id?: string): Language =>
  LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0]!;

const KEY = "sloka-language-v1";

export const loadLanguageId = () => readChoice(KEY, LANGUAGE_IDS, DEFAULT_LANGUAGE_ID);
export const saveLanguageId = (id: string) => writePref(KEY, id);
