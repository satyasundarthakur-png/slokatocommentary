# slokatocomentary

Build "AshtavakraTika" — an Odia Vedantic commentary generator web app.

STACK: React + Vite + TypeScript + Tailwind CSS. Use Groq API (openai/gpt-oss-120b model) 

for generation via a server function/edge function (do not expose API key client-side — 

route through a backend function, same pattern as my other prescription apps).

CORE FLOW:

1. Input form with fields:

   - Sanskrit verse + reference (required, textarea) — e.g. chapter.verse + granth name

   - Sahayak grantha / supporting texts allowed to cite (optional, text input, comma separated)

   - Desired length (optional, dropdown: short/medium/long ~400-700 words default)

   - Vishaya/topic focus (optional, text input)

   - If only a verse number is given with no Sanskrit text, the app must NOT fabricate the 

     verse — show a validation message asking the user to paste the actual Sanskrit text first.

2. On submit, call Groq chat completion with a SYSTEM PROMPT set exactly to the following 

   (paste this full text verbatim as the system message — it's a detailed Odia commentary 

   style guide, treat it as opaque, don't modify or summarize it):

   [PASTE THE FULL UPLOADED ODIA SYSTEM PROMPT TEXT HERE VERBATIM]

   User message = the verse + context + optional fields formatted clearly, in Odia labels 

   (ଶ୍ଲୋକ:, ସନ୍ଦର୍ଭ:, ସହାୟକ ଗ୍ରନ୍ଥ:, ଦୀର୍ଘତା:, ବିଷୟ:).

3. DISPLAY: render the returned Odia commentary in a reading-optimized panel:

   - Odia script font (e.g. Noto Sans Oriya) throughout

   - The verse block (ମୂଳ ଶ୍ଲୋକ) visually centered, reference in italic right-aligned

   - "●" unit separators rendered as centered dividers between commentary units

   - Right-to-left flowing paragraph text, generous line height for readability

   - Preserve paragraph/unit structure from the model output — do not collapse into bullets

4. HISTORY: store each generated unit (verse text, reference, full commentary, timestamp) 

   in localStorage as a running "book" — a running list the user is building verse by verse. 

   Sidebar shows past units by reference, clickable to revisit. Include a way to reorder/

   delete units.

5. DOCX EXPORT: "Export as DOCX" button that formats the accumulated units per print spec:

   - Verse centered, reference in italic, right-aligned

   - Commentary body in justified Odia-script paragraphs

   - "●" centered as a section divider between units

   - Export ALL units in the current history/book as one continuous DOCX, in the order 

     shown in the sidebar

   Use a docx generation library (docx.js) client-side, or a small backend function if needed.

6. REGENERATE: allow regenerating a single unit with the same inputs (in case of an 

   inconsistent/failed generation), without disturbing other units in the book.

7. UI: clean, minimal, warm off-white/parchment background evoking a printed book page — 

   not a typical AI-tool UI. Header: "अष्टावक्रगीता — ଓଡ଼ିଆ ଟୀକା" or similar. No chat bubbles, 

   no assistant-style framing — it should feel like a manuscript editor, not a chatbot.

TECH DETAILS:

- Use bun, not npm

- Exclude src/routeTree.gen.ts, bun.lock from version control expectations

- Groq call via server function (TanStack Start server function or Supabase edge function, 

  whichever matches project scaffold), never client-side key exposure

- Keep the system prompt in a single constant file (e.g. src/lib/tikaSystemPrompt.ts) so 

  it's easy to update later without touching UI code

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://slokatocommentary.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/30944844-1d48-4702-879b-d731ab22d4d6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
