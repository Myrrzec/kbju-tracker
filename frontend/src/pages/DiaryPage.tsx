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

  const stats = summary
    ? [
        { value: summary.total_calories, label: "ккал", color: "text-cal" },
        { value: summary.total_protein_g, label: "белки, г", color: "text-protein" },
        { value: summary.total_fat_g, label: "жиры, г", color: "text-fat" },
        { value: summary.total_carbs_g, label: "углеводы, г", color: "text-carbs" },
      ]
    : [];

  return (
    <div className="space-y-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[40px] leading-tight font-bold">Дневник</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input !w-auto" />
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface border border-line rounded-[18px] py-5 px-6">
              <p className={`text-3xl font-bold ${stat.color}`}>{Math.round(stat.value)}</p>
              <p className="text-[13px] text-ink-2 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <AddEntryPanel title="Записи за день" date={date} loggedAt={date === todayStr() ? undefined : `${date}T12:00:00`}>
        {summary && <EntryList entries={summary.entries} onDelete={(id) => deleteMutation.mutate(id)} />}
      </AddEntryPanel>
    </div>
  );
}
