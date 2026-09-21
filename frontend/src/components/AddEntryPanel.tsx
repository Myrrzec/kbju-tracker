import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as diaryApi from "../lib/api/diary";
import type { MealEntry, MealEntryCreatePayload } from "../types";
import { EntryForm } from "./EntryForm";
import { PhotoRecognizer } from "./PhotoRecognizer";
import { CameraIcon, PencilIcon } from "./icons";

type Mode = "manual" | "photo" | null;

interface AddEntryPanelProps {
  title: string;
  date: string;
  loggedAt?: string;
  children: ReactNode;
}

export function AddEntryPanel({ title, date, loggedAt, children }: AddEntryPanelProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>(null);
  const [prefill, setPrefill] = useState<{ key: number; entry?: MealEntry }>({ key: 0 });

  const recentQuery = useQuery({
    queryKey: ["recent-entries"],
    queryFn: diaryApi.getRecentEntries,
    enabled: mode === "manual",
  });

  const createMutation = useMutation({
    mutationFn: (payload: MealEntryCreatePayload) =>
      diaryApi.createEntry(loggedAt ? { ...payload, logged_at: loggedAt } : payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-summary", date] });
      queryClient.invalidateQueries({ queryKey: ["recent-entries"] });
    },
  });

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-[22px] font-bold">{title}</h2>
        {mode === null && (
          <div className="flex gap-2">
            <button onClick={() => setMode("manual")} className="btn btn-secondary">
              <PencilIcon /> Вручную
            </button>
            <button onClick={() => setMode("photo")} className="btn btn-primary">
              <CameraIcon /> По фото (ИИ)
            </button>
          </div>
        )}
      </div>

      {mode === "manual" && (
        <div className="mb-8 pb-8 border-b border-line-soft">
          {recentQuery.data && recentQuery.data.length > 0 && (
            <div className="mb-6">
              <p className="label">Недавние блюда</p>
              <div className="flex flex-wrap gap-2">
                {recentQuery.data.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setPrefill((p) => ({ key: p.key + 1, entry }))}
                    className="btn btn-secondary !min-h-9 !py-1.5 !px-3 !text-sm max-w-full"
                    title={`${entry.grams} г · ${Math.round(entry.calories)} ккал`}
                  >
                    <span className="truncate">{entry.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <EntryForm
            key={prefill.key}
            initial={
              prefill.entry
                ? {
                    name: prefill.entry.name,
                    meal_type: prefill.entry.meal_type,
                    grams: prefill.entry.grams,
                    calories: prefill.entry.calories,
                    protein_g: prefill.entry.protein_g,
                    fat_g: prefill.entry.fat_g,
                    carbs_g: prefill.entry.carbs_g,
                  }
                : undefined
            }
            onSubmit={async (payload) => {
              await createMutation.mutateAsync(payload);
              setMode(null);
            }}
            onCancel={() => setMode(null)}
          />
        </div>
      )}

      {mode === "photo" && (
        <div className="mb-8 pb-8 border-b border-line-soft">
          <PhotoRecognizer onAdd={(payload) => createMutation.mutateAsync(payload)} onClose={() => setMode(null)} />
        </div>
      )}

      {children}
    </div>
  );
}
