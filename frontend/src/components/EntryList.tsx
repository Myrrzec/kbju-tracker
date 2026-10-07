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
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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
    return (
      <div className="text-center py-10 px-4 border border-dashed border-line rounded-2xl animate-fade">
        <p className="font-medium">Nothing logged yet</p>
        <p className="text-sm text-ink-2 mt-1">Add a meal by hand, or snap a photo and let the AI estimate it.</p>
      </div>
    );
  }

  const meals = groupIntoMeals(entries);

  return (
    <div className="space-y-6">
      {deleteMutation.isError && (
        <p role="alert" className="text-sm text-danger animate-fade">
          Couldn't delete the entry. Please try again.
        </p>
      )}
      {meals.map((meal) => (
        <section key={meal.key} className="animate-rise">
          <header className="bg-surface-2 rounded-xl border-l-[3px] border-protein px-5 py-3.5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{meal.label}</h3>
              <p className="text-[13px] text-ink-2">{formatTime(meal.startedAt)}</p>
            </div>
            <p className="text-[13px] text-ink-2 text-right">
              <span className="block text-base font-semibold text-ink">{Math.round(meal.totals.calories)} kcal</span>
              P {Math.round(meal.totals.protein_g)} · F {Math.round(meal.totals.fat_g)} · C{" "}
              {Math.round(meal.totals.carbs_g)}
            </p>
          </header>
          <ul>
            {meal.entries.map((entry) => (
              <li key={entry.id} className="py-4 border-b border-line-soft last:border-b-0 animate-fade">
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
                    submitLabel="Save"
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
                        {entry.grams} g · {Math.round(entry.calories)} kcal · P {Math.round(entry.protein_g)} F{" "}
                        {Math.round(entry.fat_g)} C {Math.round(entry.carbs_g)}
                        {entry.source === "photo_ai" && " · from photo"}
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      <button
                        onClick={() => setEditingId(entry.id)}
                        className="btn-ghost"
                        aria-label={`Edit entry “${entry.name}”`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(entry.id)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === entry.id}
                        className="btn-ghost disabled:opacity-50"
                        aria-label={`Delete entry “${entry.name}”`}
                      >
                        Delete
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
