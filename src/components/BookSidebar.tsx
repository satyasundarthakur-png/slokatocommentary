import type { TikaUnit } from "@/lib/book";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookSidebar({
  units,
  activeId,
  onSelect,
  onMove,
  onDelete,
}: {
  units: TikaUnit[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xl text-fuchsia-800">ଗ୍ରନ୍ଥର ଏକକ</p>
        <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-2.5 py-0.5 font-interface text-[0.65rem] font-bold text-white shadow-[0_0_12px_#d946ef]">{units.length}</span>
      </div>
      {units.length === 0 && (
        <p className="text-sm text-muted-foreground/80">ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଏକକ ନାହିଁ।</p>
      )}
      <ol className="space-y-1">
        {units.map((u, i) => (
          <li
            key={u.id}
            className={`glow-row group flex items-center gap-1 rounded-xl border-l-4 px-2 py-2 ${
              u.id === activeId
                ? "border-fuchsia-500 bg-gradient-to-r from-amber-200/60 to-fuchsia-200/50 shadow-[0_0_18px_#e879f966]"
                : "border-transparent hover:bg-accent/50"
            }`}
          >
            <Button
              variant="ghost"
              onClick={() => onSelect(u.id)}
              className="h-auto min-w-0 flex-1 justify-start truncate rounded-none px-1 py-1 text-left text-sm font-normal text-foreground hover:bg-transparent"
              title={u.reference}
            >
              <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
              {u.reference}
            </Button>
            <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button variant="ghost" size="icon"
                aria-label="ଉପରକୁ"
                onClick={() => onMove(i, -1)}
                className="size-7 rounded-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon"
                aria-label="ତଳକୁ"
                onClick={() => onMove(i, 1)}
                className="size-7 rounded-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon"
                aria-label="ବିଲୋପ"
                onClick={() => onDelete(u.id)}
                className="size-7 rounded-sm text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
