import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import * as diaryApi from "../lib/api/diary";
import { todayStr } from "../lib/date";
import { MacroBar } from "../components/MacroBar";
import { EntryForm } from "../components/EntryForm";
import { EntryList } from "../components/EntryList";
import { ApiError } from "../lib/apiClient";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
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

  const createMutation = useMutation({
    mutationFn: diaryApi.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-summary", today] });
      setShowAddForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: diaryApi.deleteEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary-summary", today] }),
  });

  const profileIncomplete = targetsQuery.isError && targetsQuery.error instanceof ApiError && targetsQuery.error.status === 400;

  const targets = targetsQuery.data;
  const summary = summaryQuery.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-1">Сегодня</h1>
        <p className="text-sm text-neutral-500">{today}</p>
      </div>

      {profileIncomplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Заполните профиль, чтобы увидеть целевые показатели КБЖУ.{" "}
          <Link to="/profile" className="underline font-medium">
            Перейти в профиль
          </Link>
        </div>
      )}

      {targets && summary && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <MacroBar label="Калории" current={summary.total_calories} target={targets.calories} unit="ккал" colorClass="bg-brand-500" />
          <MacroBar label="Белки" current={summary.total_protein_g} target={targets.protein_g} unit="г" colorClass="bg-sky-500" />
          <MacroBar label="Жиры" current={summary.total_fat_g} target={targets.fat_g} unit="г" colorClass="bg-amber-500" />
          <MacroBar label="Углеводы" current={summary.total_carbs_g} target={targets.carbs_g} unit="г" colorClass="bg-violet-500" />
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Приёмы пищи</h2>
          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="text-sm text-brand-600 hover:underline">
              + Добавить запись
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="mb-4 pb-4 border-b border-neutral-100">
            <EntryForm onSubmit={(payload) => createMutation.mutateAsync(payload)} onCancel={() => setShowAddForm(false)} />
          </div>
        )}

        {summary && <EntryList entries={summary.entries} onDelete={(id) => deleteMutation.mutate(id)} />}
      </div>
    </div>
  );
}
