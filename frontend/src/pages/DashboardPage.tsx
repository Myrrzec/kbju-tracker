import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import * as diaryApi from "../lib/api/diary";
import { formatDateLong, todayStr } from "../lib/date";
import { MacroBar } from "../components/MacroBar";
import { CalorieRing } from "../components/CalorieRing";
import { AddEntryPanel } from "../components/AddEntryPanel";
import { EntryList } from "../components/EntryList";
import { QueryError } from "../components/QueryError";
import { Skeleton } from "../components/Skeleton";
import { ApiError } from "../lib/apiClient";

export function DashboardPage() {
  const today = todayStr();

  const targetsQuery = useQuery({
    queryKey: ["targets"],
    queryFn: usersApi.getTargets,
    retry: false,
  });

  const summaryQuery = useQuery({
    queryKey: ["diary-summary", today],
    queryFn: () => diaryApi.getDailySummary(today),
  });

  const profileIncomplete =
    targetsQuery.isError && targetsQuery.error instanceof ApiError && targetsQuery.error.status === 400;
  const targetsFailed = targetsQuery.isError && !profileIncomplete;

  const targets = targetsQuery.data;
  const summary = summaryQuery.data;

  return (
    <div className="space-y-9 stagger">
      <div>
        <h1 className="text-[34px] sm:text-[40px] leading-tight font-bold">Today</h1>
        <p className="text-ink-2 mt-1">{formatDateLong(today)}</p>
      </div>

      {profileIncomplete && (
        <div className="card !p-5 sm:!p-6 text-ink-2">
          Fill in your profile to see your daily calorie and macro targets.{" "}
          <Link to="/profile" className="text-protein underline underline-offset-4">
            Go to profile
          </Link>
        </div>
      )}

      {targetsFailed && <QueryError message="Couldn't load your daily targets." onRetry={() => targetsQuery.refetch()} />}

      {targets && summary && (
        <div className="card flex flex-col sm:flex-row items-center gap-8 sm:gap-14">
          <CalorieRing current={summary.total_calories} target={targets.calories} />
          <div className="w-full space-y-6">
            <MacroBar label="Protein" current={summary.total_protein_g} target={targets.protein_g} unit="g" metric="protein" />
            <MacroBar label="Fat" current={summary.total_fat_g} target={targets.fat_g} unit="g" metric="fat" />
            <MacroBar label="Carbs" current={summary.total_carbs_g} target={targets.carbs_g} unit="g" metric="carbs" />
          </div>
        </div>
      )}

      {!profileIncomplete && !targetsFailed && !(targets && summary) && !summaryQuery.isError && (
        <div className="card flex flex-col sm:flex-row items-center gap-8 sm:gap-14" aria-hidden="true">
          <Skeleton className="size-[200px] sm:size-[220px] shrink-0 !rounded-full" />
          <div className="w-full space-y-6">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
      )}

      {summaryQuery.isError && (
        <QueryError message="Couldn't load today's entries." onRetry={() => summaryQuery.refetch()} />
      )}

      <AddEntryPanel title="Meals" date={today}>
        {summary ? <EntryList entries={summary.entries} date={today} /> : !summaryQuery.isError && <Skeleton className="h-24" />}
      </AddEntryPanel>
    </div>
  );
}
