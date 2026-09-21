interface CalorieRingProps {
  current: number;
  target: number;
}

export function CalorieRing({ current, target }: CalorieRingProps) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div
      className="relative size-[220px] shrink-0 rounded-full"
      style={{
        background: `conic-gradient(var(--color-cal) ${percent}%, var(--color-line-soft) 0)`,
        filter: "drop-shadow(0 0 14px rgb(77 255 209 / 0.3))",
      }}
      role="img"
      aria-label={`Калории: ${Math.round(current)} из ${Math.round(target)}`}
    >
      <div className="absolute inset-[22px] rounded-full bg-surface flex flex-col items-center justify-center">
        <span className="text-[44px] leading-none font-bold text-cal">{Math.round(current)}</span>
        <span className="text-sm text-ink-2 mt-2">/ {Math.round(target)} ккал</span>
      </div>
    </div>
  );
}
