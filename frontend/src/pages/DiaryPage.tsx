import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as diaryApi from "../lib/api/diary";
import { todayStr } from "../lib/date";
import { AddEntryPanel } from "../components/AddEntryPanel";
import { EntryList } from "../components/EntryList";

export function DiaryPage() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayStr());

  const summaryQuery = useQuery({
    queryKey: ["diary-summary", date],
    queryFn: () => diaryApi.getDailySummary(date),
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

      <AddEntryPanel title="Записи за день" date={date} loggedAt={date === todayStr() ? undefined : `${date}T12:00:00`}>
        {summary && <EntryList entries={summary.entries} onDelete={(id) => deleteMutation.mutate(id)} />}
      </AddEntryPanel>
    </div>
  );
}
