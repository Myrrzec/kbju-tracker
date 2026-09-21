import { useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import * as recognitionApi from "../lib/api/recognition";
import { ApiError } from "../lib/apiClient";
import type { MealEntryCreatePayload, MealType } from "../types";
import { RecognizedItemCard } from "./RecognizedItemCard";
import { CameraIcon } from "./icons";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

function defaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

interface PhotoRecognizerProps {
  onAdd: (payload: MealEntryCreatePayload) => Promise<unknown>;
  onClose: () => void;
}

export function PhotoRecognizer({ onAdd, onClose }: PhotoRecognizerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);

  const recognizeMutation = useMutation({
    mutationFn: (f: File) => recognitionApi.recognizePhoto(f),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
    recognizeMutation.reset();
  };

  const result = recognizeMutation.data;

  return (
    <div className="space-y-5">
      <p className="text-ink-2">
        Загрузите фото блюда — ИИ оценит состав и КБЖУ. Перед добавлением можно поправить граммовку и цифры.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-ink-2 file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-xl file:border file:border-line file:bg-surface-2 file:px-[18px] file:text-ink hover:file:border-ink-3"
      />

      {previewUrl && (
        <img src={previewUrl} alt="Предпросмотр фото" className="max-h-64 rounded-xl border border-line" />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => file && recognizeMutation.mutate(file)}
          disabled={!file || recognizeMutation.isPending}
          className="btn btn-primary"
        >
          <CameraIcon /> {recognizeMutation.isPending ? "Анализируем..." : "Распознать"}
        </button>
        <button onClick={onClose} className="btn-ghost">
          Закрыть
        </button>
      </div>

      {recognizeMutation.isError && (
        <p className="text-sm text-danger">
          {recognizeMutation.error instanceof ApiError
            ? recognizeMutation.error.message
            : "Не удалось распознать фото"}
        </p>
      )}

      {result && (
        <div className="space-y-3">
          {result.items.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-ink-2">Приём пищи для всех блюд:</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="input !w-auto"
              >
                {Object.entries(MEAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {result.notes && (
            <p className="text-sm text-ink-2 bg-surface-2 border border-line rounded-xl px-4 py-3">{result.notes}</p>
          )}
          {result.items.length === 0 ? (
            <p className="text-ink-2">Еда на фото не распознана.</p>
          ) : (
            result.items.map((item, index) => (
              <RecognizedItemCard
                key={index}
                item={item}
                photoUrl={result.photo_url}
                onAdd={onAdd}
                mealType={mealType}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
