interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  colorClass: string;
}

export function MacroBar({ label, current, target, unit, colorClass }: MacroBarProps) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = target > 0 && current > target;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className={isOver ? "text-orange-600 font-medium" : "text-neutral-900"}>
          {Math.round(current)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${isOver ? "bg-orange-400" : colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
