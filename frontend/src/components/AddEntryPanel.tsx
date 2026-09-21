import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as diaryApi from "../lib/api/diary";
import type { MealEntryCreatePayload } from "../types";
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

  const createMutation = useMutation({
    mutationFn: (payload: MealEntryCreatePayload) =>
      diaryApi.createEntry(loggedAt ? { ...payload, logged_at: loggedAt } : payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary-summary", date] }),
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
        <div className="mb-8 pb-8 border-b border-line-soft">
          <PhotoRecognizer onAdd={(payload) => createMutation.mutateAsync(payload)} onClose={() => setMode(null)} />
        </div>
      )}

      {children}
    </div>
  );
}
