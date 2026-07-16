// Generative, designed placeholder media for a project — an abstract interface
// composition that varies by `seed`, so each project reads distinct without a
// real screenshot. Swap for <Image> (Next optimisation) once real shots / Gemini
// imagery are available. Scales on parent :hover via the `.pm-shot` transform.
export function ProjectMedia({ seed = 0, className = "" }: { seed?: number; className?: string }) {
  const variant = seed % 3;
  return (
    <div className={`pm-shot relative h-full w-full overflow-hidden ${className}`}>
      {/* ambient ground */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === 0
              ? "radial-gradient(120% 90% at 78% 12%, color-mix(in oklab, var(--color-cobalt) 26%, transparent), transparent 60%), linear-gradient(160deg, var(--color-surface-2), var(--color-ink-2, #14131b))"
              : variant === 1
                ? "radial-gradient(110% 100% at 15% 90%, color-mix(in oklab, var(--color-cobalt) 22%, transparent), transparent 62%), linear-gradient(200deg, var(--color-surface), var(--color-surface-2))"
                : "conic-gradient(from 210deg at 70% 30%, color-mix(in oklab, var(--color-cobalt) 20%, transparent), transparent 40%), linear-gradient(180deg, var(--color-surface-2), var(--color-surface))",
        }}
      />
      {/* fine grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, #000, transparent 80%)",
        }}
      />
      {/* abstract interface blocks */}
      <div className="absolute inset-0 p-7 md:p-9">
        {variant === 0 && (
          <>
            <div className="h-2.5 w-2/5 rounded-full" style={{ background: "color-mix(in oklab, var(--color-ink) 20%, transparent)" }} />
            <div className="mt-3 h-2.5 w-1/4 rounded-full" style={{ background: "color-mix(in oklab, var(--color-ink) 12%, transparent)" }} />
            <div className="mt-7 h-9 w-36 rounded-[4px]" style={{ background: "var(--color-cobalt)" }} />
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-[4px]" style={{ background: "color-mix(in oklab, var(--color-ink) 8%, transparent)" }} />
              ))}
            </div>
          </>
        )}
        {variant === 1 && (
          <div className="flex h-full gap-4">
            <div className="flex w-1/2 flex-col justify-center gap-3">
              <div className="h-3 w-4/5 rounded-full" style={{ background: "color-mix(in oklab, var(--color-ink) 22%, transparent)" }} />
              <div className="h-3 w-3/5 rounded-full" style={{ background: "color-mix(in oklab, var(--color-ink) 14%, transparent)" }} />
              <div className="mt-3 h-8 w-28 rounded-[4px]" style={{ background: "var(--color-cobalt)" }} />
            </div>
            <div className="w-1/2 rounded-[6px]" style={{ background: "color-mix(in oklab, var(--color-cobalt) 14%, transparent)", border: "1px solid var(--color-line)" }} />
          </div>
        )}
        {variant === 2 && (
          <>
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-24 rounded-full" style={{ background: "color-mix(in oklab, var(--color-ink) 18%, transparent)" }} />
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2.5 w-8 rounded-full" style={{ background: "color-mix(in oklab, var(--color-ink) 10%, transparent)" }} />
                ))}
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[16/9] rounded-[5px]" style={{ background: i === 0 ? "color-mix(in oklab, var(--color-cobalt) 20%, transparent)" : "color-mix(in oklab, var(--color-ink) 7%, transparent)" }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
