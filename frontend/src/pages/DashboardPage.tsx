import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import * as diaryApi from "../lib/api/diary";
import { formatDateRu, todayStr } from "../lib/date";
import { MacroBar } from "../components/MacroBar";
import { CalorieRing } from "../components/CalorieRing";
import { AddEntryPanel } from "../components/AddEntryPanel";
import { EntryList } from "../components/EntryList";
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

  const profileIncomplete = targetsQuery.isError && targetsQuery.error instanceof ApiError && targetsQuery.error.status === 400;

  const targets = targetsQuery.data;
  const summary = summaryQuery.data;

  return (
    <div className="space-y-9">
      <div>
        <h1 className="text-[40px] leading-tight font-bold">Сегодня</h1>
        <p className="text-ink-2 mt-1">{formatDateRu(today)}</p>
      </div>

      {profileIncomplete && (
        <div className="card !p-5 sm:!p-6 text-ink-2">
          Заполните профиль, чтобы увидеть целевые показатели КБЖУ.{" "}
          <Link to="/profile" className="text-protein underline underline-offset-4">
            Перейти в профиль
          </Link>
        </div>
      )}

      {targets && summary && (
        <div className="card flex flex-col sm:flex-row items-center gap-8 sm:gap-14">
          <CalorieRing current={summary.total_calories} target={targets.calories} />
          <div className="w-full space-y-6">
            <MacroBar label="Белки" current={summary.total_protein_g} target={targets.protein_g} unit="г" metric="protein" />
            <MacroBar label="Жиры" current={summary.total_fat_g} target={targets.fat_g} unit="г" metric="fat" />
            <MacroBar label="Углеводы" current={summary.total_carbs_g} target={targets.carbs_g} unit="г" metric="carbs" />
          </div>
        </div>
      )}

      <AddEntryPanel title="Приёмы пищи" date={today}>
        {summary && <EntryList entries={summary.entries} date={today} />}
      </AddEntryPanel>
    </div>
  );
}
