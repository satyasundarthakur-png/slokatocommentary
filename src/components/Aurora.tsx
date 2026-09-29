import { useEffect } from "react";

const doodles = [
  { c: "#f59e0b", x: "6%", y: "14%", s: 54, d: 0, p: "M4 30 Q16 4 28 30 T52 30" },
  { c: "#ec4899", x: "88%", y: "10%", s: 60, d: 1.2, p: "M30 4 L36 24 L56 30 L36 36 L30 56 L24 36 L4 30 L24 24 Z" },
  { c: "#06b6d4", x: "92%", y: "58%", s: 58, d: 0.6, p: "M30 30 m0 -3 a3 3 0 1 1 -3 3 a8 8 0 1 1 8 8 a14 14 0 1 1 -14 -14 a20 20 0 1 1 20 20" },
  { c: "#8b5cf6", x: "3%", y: "66%", s: 50, d: 2, p: "M30 8 C42 20 42 40 30 52 C18 40 18 20 30 8 M8 30 C20 18 40 18 52 30 C40 42 20 42 8 30" },
  { c: "#22c55e", x: "48%", y: "90%", s: 56, d: 1.8, p: "M4 40 C14 10 22 50 32 22 S48 40 56 14" },
  { c: "#f97316", x: "72%", y: "84%", s: 46, d: 0.9, p: "M30 6 A24 24 0 1 0 54 30 M30 16 A14 14 0 1 0 44 30" },
  { c: "#f43f5e", x: "24%", y: "92%", s: 44, d: 2.6, p: "M30 50 C6 32 10 10 30 22 C50 10 54 32 30 50 Z" },
];

export function Aurora() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${e.clientX}px`);
        root.style.setProperty("--my", `${e.clientY}px`);
        const card = (e.target as HTMLElement | null)?.closest<HTMLElement>(".glow-card");
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--x", `${e.clientX - r.left}px`);
          card.style.setProperty("--y", `${e.clientY - r.top}px`);
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora-blob left-[-10%] top-[-10%] h-[42rem] w-[42rem] bg-fuchsia-400/40" />
      <div className="aurora-blob right-[-12%] top-[10%] h-[38rem] w-[38rem] bg-amber-300/50 [animation-delay:-6s]" />
      <div className="aurora-blob bottom-[-16%] left-[20%] h-[40rem] w-[40rem] bg-cyan-300/40 [animation-delay:-12s]" />
      <div className="aurora-blob bottom-[-10%] right-[-6%] h-[30rem] w-[30rem] bg-violet-400/40 [animation-delay:-3s]" />
      {doodles.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 60 60"
          width={d.s}
          height={d.s}
          className="doodle absolute"
          style={{ left: d.x, top: d.y, animationDelay: `${d.d}s`, color: d.c }}
        >
          <path d={d.p} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
      <div className="cursor-glow" />
    </div>
  );
}
