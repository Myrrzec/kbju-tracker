import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as diaryApi from "../lib/api/diary";
import type { MealEntryCreatePayload } from "../types";
import { EntryForm } from "./EntryForm";
import { PhotoRecognizer } from "./PhotoRecognizer";

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

  const createMutation = useMutation({
    mutationFn: (payload: MealEntryCreatePayload) =>
      diaryApi.createEntry(loggedAt ? { ...payload, logged_at: loggedAt } : payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary-summary", date] }),
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="font-medium">{title}</h2>
        {mode === null && (
          <div className="flex gap-2">
            <button
              onClick={() => setMode("manual")}
              className="text-sm border border-neutral-300 hover:border-brand-500 hover:text-brand-700 rounded-full px-3 py-1.5"
            >
              ✍️ Вручную
            </button>
            <button
              onClick={() => setMode("photo")}
              className="text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-full px-3 py-1.5"
            >
              📷 По фото (ИИ)
            </button>
          </div>
        )}
      </div>

      {mode === "manual" && (
        <div className="mb-4 pb-4 border-b border-neutral-100">
          <EntryForm
            onSubmit={async (payload) => {
              await createMutation.mutateAsync(payload);
              setMode(null);
            }}
            onCancel={() => setMode(null)}
          />
        </div>
      )}

      {mode === "photo" && (
        <div className="mb-4 pb-4 border-b border-neutral-100">
          <PhotoRecognizer onAdd={(payload) => createMutation.mutateAsync(payload)} onClose={() => setMode(null)} />
        </div>
      )}

      {children}
    </div>
  );
}
