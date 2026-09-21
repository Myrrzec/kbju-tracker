import { groupIntoMeals } from "../lib/groupMeals";
import type { MealEntry } from "../types";

interface EntryListProps {
  entries: MealEntry[];
  onDelete: (id: string) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function EntryList({ entries, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-neutral-400 py-4">Записей пока нет</p>;
  }

  const meals = groupIntoMeals(entries);

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <section key={meal.key} className="border border-neutral-200 rounded-xl overflow-hidden">
          <header className="bg-neutral-50 px-4 py-2.5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">{meal.label}</h3>
              <p className="text-xs text-neutral-500">{formatTime(meal.startedAt)}</p>
            </div>
            <p className="text-xs text-neutral-600 text-right">
              <span className="font-medium text-neutral-900">{Math.round(meal.totals.calories)} ккал</span>
              <br />Б {Math.round(meal.totals.protein_g)} · Ж {Math.round(meal.totals.fat_g)} · У{" "}
              {Math.round(meal.totals.carbs_g)}
            </p>
          </header>
          <ul className="divide-y divide-neutral-100 px-4">
            {meal.entries.map((entry) => (
              <li key={entry.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate">{entry.name}</p>
                  <p className="text-xs text-neutral-500">
                    {entry.grams} г · {Math.round(entry.calories)} ккал · Б {Math.round(entry.protein_g)} Ж{" "}
                    {Math.round(entry.fat_g)} У {Math.round(entry.carbs_g)}
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
        </section>
      ))}
    </div>
  );
}
