import type { CSSProperties } from "react";
import { useCountUp, useEntered } from "../lib/motion";

interface CalorieRingProps {
  current: number;
  target: number;
}

export function CalorieRing({ current, target }: CalorieRingProps) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const arc = useEntered(percent);
  const shown = useCountUp(current);

  return (
    <div
      className="calorie-ring relative size-[200px] sm:size-[220px] shrink-0 rounded-full"
      style={{ "--p": `${arc}%`, filter: "drop-shadow(0 0 14px rgb(77 255 209 / 0.3))" } as CSSProperties}
      role="img"
      aria-label={`Calories: ${Math.round(current)} of ${Math.round(target)}`}
    >
      <div className="absolute inset-[22px] rounded-full bg-surface flex flex-col items-center justify-center">
        <span className="text-[44px] leading-none font-bold text-cal">{Math.round(shown)}</span>
        <span className="text-sm text-ink-2 mt-2">/ {Math.round(target)} kcal</span>
      </div>
    </div>
  );
}
