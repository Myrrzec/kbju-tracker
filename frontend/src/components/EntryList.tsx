import type { MealEntry, MealType } from "../types";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

interface EntryListProps {
  entries: MealEntry[];
  onDelete: (id: string) => void;
}

export function EntryList({ entries, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-neutral-400 py-4">Записей пока нет</p>;
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {entries.map((entry) => (
        <li key={entry.id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{entry.name}</p>
            <p className="text-xs text-neutral-500">
              {MEAL_LABELS[entry.meal_type]} · {entry.grams} г · {Math.round(entry.calories)} ккал · Б{" "}
              {Math.round(entry.protein_g)} Ж {Math.round(entry.fat_g)} У {Math.round(entry.carbs_g)}
              {entry.source === "photo_ai" && " · по фото"}
            </p>
          </div>
          <button
            onClick={() => onDelete(entry.id)}
            className="text-neutral-300 hover:text-red-500 text-sm shrink-0"
            aria-label="Удалить запись"
          >
            Удалить
          </button>
        </li>
      ))}
    </ul>
  );
}
