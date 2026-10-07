import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as diaryApi from "../lib/api/diary";
import { localNoonIso, todayStr } from "../lib/date";
import { AddEntryPanel } from "../components/AddEntryPanel";
import { EntryList } from "../components/EntryList";
import { QueryError } from "../components/QueryError";
import { Skeleton } from "../components/Skeleton";

export function DiaryPage() {
  const [date, setDate] = useState(todayStr());

  const summaryQuery = useQuery({
    queryKey: ["diary-summary", date],
    queryFn: () => diaryApi.getDailySummary(date),
  });

  const summary = summaryQuery.data;

  const stats = summary
    ? [
        { value: summary.total_calories, label: "kcal", color: "text-cal" },
        { value: summary.total_protein_g, label: "protein, g", color: "text-protein" },
        { value: summary.total_fat_g, label: "fat, g", color: "text-fat" },
        { value: summary.total_carbs_g, label: "carbs, g", color: "text-carbs" },
      ]
    : [];

  return (
    <div className="space-y-9 stagger">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[34px] sm:text-[40px] leading-tight font-bold">Diary</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          aria-label="Choose a day"
          className="input !w-auto"
        />
      </div>

      {summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface border border-line rounded-[18px] py-5 px-6">
              <p className={`text-3xl font-bold ${stat.color}`}>{Math.round(stat.value)}</p>
              <p className="text-[13px] text-ink-2 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : (
        !summaryQuery.isError && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[92px] !rounded-[18px]" />
            ))}
          </div>
        )
      )}

      {summaryQuery.isError && (
        <QueryError message="Couldn't load this day." onRetry={() => summaryQuery.refetch()} />
      )}

      <AddEntryPanel title="Entries for the day" date={date} loggedAt={date === todayStr() ? undefined : localNoonIso(date)}>
        {summary ? <EntryList entries={summary.entries} date={date} /> : !summaryQuery.isError && <Skeleton className="h-24" />}
      </AddEntryPanel>
    </div>
  );
}
