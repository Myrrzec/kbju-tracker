import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as diaryApi from "../lib/api/diary";
import { todayStr } from "../lib/date";
import { EntryForm } from "../components/EntryForm";
import { EntryList } from "../components/EntryList";

export function DiaryPage() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayStr());
  const [showAddForm, setShowAddForm] = useState(false);

  const summaryQuery = useQuery({
    queryKey: ["diary-summary", date],
    queryFn: () => diaryApi.getDailySummary(date),
  });

  const createMutation = useMutation({
    mutationFn: diaryApi.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-summary", date] });
      setShowAddForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: diaryApi.deleteEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary-summary", date] }),
  });

  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Дневник</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
        />
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-white border border-neutral-200 rounded-xl py-3">
            <p className="text-lg font-semibold">{Math.round(summary.total_calories)}</p>
            <p className="text-xs text-neutral-500">ккал</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl py-3">
            <p className="text-lg font-semibold">{Math.round(summary.total_protein_g)}</p>
            <p className="text-xs text-neutral-500">белки, г</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl py-3">
            <p className="text-lg font-semibold">{Math.round(summary.total_fat_g)}</p>
            <p className="text-xs text-neutral-500">жиры, г</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl py-3">
            <p className="text-lg font-semibold">{Math.round(summary.total_carbs_g)}</p>
            <p className="text-xs text-neutral-500">углеводы, г</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Записи за день</h2>
          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="text-sm text-brand-600 hover:underline">
              + Добавить запись
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="mb-4 pb-4 border-b border-neutral-100">
            <EntryForm
              onSubmit={(payload) =>
                createMutation.mutateAsync({
                  ...payload,
                  logged_at: `${date}T12:00:00`,
                })
              }
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {summary && <EntryList entries={summary.entries} onDelete={(id) => deleteMutation.mutate(id)} />}
      </div>
    </div>
  );
}
