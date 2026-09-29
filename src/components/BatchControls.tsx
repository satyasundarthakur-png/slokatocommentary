import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labelCls } from "@/components/formStyles";

const SIZES = [25, 50, 100, 0];

/** 25 / 50 / 100 / all picker shared by the DOCX and Gita panels (0 = all). */
export function SizeChips({ value, onChange, allLabel }: { value: number; onChange: (n: number) => void; allLabel: string }) {
  return (
    <div>
      <span className={labelCls}>ଏକ ଥରରେ କେତେ ଶ୍ଲୋକ</span>
      <div className="grid grid-cols-4 gap-2">
        {SIZES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`glow-row rounded-xl border px-2 py-2 font-interface text-sm font-bold ${
              value === n
                ? "border-fuchsia-500 bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white shadow-[0_0_18px_#d946ef88]"
                : "border-fuchsia-200 bg-white/70 text-fuchsia-900"
            }`}
          >
            {n === 0 ? allLabel : n}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface BatchProgressState {
  done: number;
  total: number;
  failed: number;
}

export function BatchProgress({ progress, onCancel }: { progress: BatchProgressState; onCancel: () => void }) {
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="h-3 overflow-hidden rounded-full bg-white/70">
        <div className="glow-btn h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-center text-sm text-fuchsia-900">
        {progress.done} / {progress.total} ସମ୍ପୂର୍ଣ୍ଣ{progress.failed ? ` · ${progress.failed} ବିଫଳ` : ""}
      </p>
      <Button type="button" onClick={onCancel} variant="outline" className="w-full rounded-xl border-fuchsia-300 text-fuchsia-800">
        <Square aria-hidden="true" /> ବନ୍ଦ କରନ୍ତୁ
      </Button>
    </div>
  );
}
