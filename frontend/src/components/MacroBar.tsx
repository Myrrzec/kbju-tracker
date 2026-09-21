import { AlertIcon } from "./icons";

const STYLES = {
  protein: { text: "text-protein", bg: "bg-protein", glow: "shadow-glow-protein" },
  fat: { text: "text-fat", bg: "bg-fat", glow: "shadow-glow-fat" },
  carbs: { text: "text-carbs", bg: "bg-carbs", glow: "shadow-glow-carbs" },
} as const;

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  metric: keyof typeof STYLES;
}

export function MacroBar({ label, current, target, unit, metric }: MacroBarProps) {
  const style = STYLES[metric];
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = target > 0 && current > target;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2.5">
        <span className={`font-semibold ${style.text}`}>{label}</span>
        <span className={`font-semibold flex items-center gap-1.5 ${style.text}`}>
          {isOver && (
            <span title="Выше цели" aria-label="Выше цели">
              <AlertIcon size={14} />
            </span>
          )}
          {Math.round(current)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-line-soft">
        <div
          className={`h-full rounded-full ${style.bg} ${style.glow} ${isOver ? "animate-pulse" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
