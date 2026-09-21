import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as diaryApi from "../lib/api/diary";
import { groupIntoMeals } from "../lib/groupMeals";
import type { MealEntry } from "../types";
import { EntryForm } from "./EntryForm";

interface EntryListProps {
  entries: MealEntry[];
  date: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function EntryList({ entries, date }: EntryListProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["diary-summary", date] });

  const deleteMutation = useMutation({ mutationFn: diaryApi.deleteEntry, onSuccess: refresh });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Parameters<typeof diaryApi.updateEntry>[1]) =>
      diaryApi.updateEntry(id, payload),
    onSuccess: refresh,
  });

  if (entries.length === 0) {
    return <p className="text-ink-2 py-6">Записей пока нет</p>;
  }

  const meals = groupIntoMeals(entries);

  return (
    <div className="space-y-6">
      {meals.map((meal) => (
        <section key={meal.key}>
          <header className="bg-surface-2 rounded-xl border-l-[3px] border-protein px-5 py-3.5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{meal.label}</h3>
              <p className="text-[13px] text-ink-2">{formatTime(meal.startedAt)}</p>
            </div>
            <p className="text-[13px] text-ink-2 text-right">
              <span className="block text-base font-semibold text-ink">{Math.round(meal.totals.calories)} ккал</span>
              Б {Math.round(meal.totals.protein_g)} · Ж {Math.round(meal.totals.fat_g)} · У{" "}
              {Math.round(meal.totals.carbs_g)}
            </p>
          </header>
          <ul>
            {meal.entries.map((entry) => (
              <li key={entry.id} className="py-4 border-b border-line-soft last:border-b-0">
                {editingId === entry.id ? (
                  <EntryForm
                    initial={{
                      name: entry.name,
                      meal_type: entry.meal_type,
                      grams: entry.grams,
                      calories: entry.calories,
                      protein_g: entry.protein_g,
                      fat_g: entry.fat_g,
                      carbs_g: entry.carbs_g,
                    }}
                    submitLabel="Сохранить"
                    onCancel={() => setEditingId(null)}
                    onSubmit={async ({ name, meal_type, grams, calories, protein_g, fat_g, carbs_g }) => {
                      await updateMutation.mutateAsync({
                        id: entry.id,
                        name,
                        meal_type,
                        grams,
                        calories,
                        protein_g,
                        fat_g,
                        carbs_g,
                      });
                      setEditingId(null);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-[15px]">{entry.name}</p>
                      <p className="text-[13px] text-ink-2">
                        {entry.grams} г · {Math.round(entry.calories)} ккал · Б {Math.round(entry.protein_g)} Ж{" "}
                        {Math.round(entry.fat_g)} У {Math.round(entry.carbs_g)}
                        {entry.source === "photo_ai" && " · по фото"}
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      <button
                        onClick={() => setEditingId(entry.id)}
                        className="btn-ghost"
                        aria-label={`Изменить запись «${entry.name}»`}
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(entry.id)}
                        className="btn-ghost"
                        aria-label={`Удалить запись «${entry.name}»`}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
