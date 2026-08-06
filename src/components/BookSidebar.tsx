import type { TikaUnit } from "@/lib/book";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

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
      <p className="mb-2 text-[0.8rem] tracking-wide text-muted-foreground">
        ଗ୍ରନ୍ଥର ଏକକ ({units.length})
      </p>
      {units.length === 0 && (
        <p className="text-sm text-muted-foreground/80">ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଏକକ ନାହିଁ।</p>
      )}
      <ol className="space-y-1">
        {units.map((u, i) => (
          <li
            key={u.id}
            className={`group flex items-center gap-1 rounded-sm border px-2 py-1.5 transition-colors ${
              u.id === activeId
                ? "border-ring/60 bg-accent"
                : "border-transparent hover:bg-accent/50"
            }`}
          >
            <button
              onClick={() => onSelect(u.id)}
              className="flex-1 truncate text-left text-sm text-foreground"
              title={u.reference}
            >
              <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
              {u.reference}
            </button>
            <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                aria-label="ଉପରକୁ"
                onClick={() => onMove(i, -1)}
                className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label="ତଳକୁ"
                onClick={() => onMove(i, 1)}
                className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label="ବିଲୋପ"
                onClick={() => onDelete(u.id)}
                className="rounded-sm p-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
