import { useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import * as recognitionApi from "../lib/api/recognition";
import { ApiError } from "../lib/apiClient";
import type { MealEntryCreatePayload } from "../types";
import { RecognizedItemCard } from "./RecognizedItemCard";

interface PhotoRecognizerProps {
  onAdd: (payload: MealEntryCreatePayload) => Promise<unknown>;
  onClose: () => void;
}

export function PhotoRecognizer({ onAdd, onClose }: PhotoRecognizerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Загрузите фото блюда — ИИ оценит состав и КБЖУ. Перед добавлением можно поправить граммовку и цифры.
      </p>

      <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />

      {previewUrl && (
        <img src={previewUrl} alt="Предпросмотр фото" className="max-h-64 rounded-xl border border-neutral-200" />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => file && recognizeMutation.mutate(file)}
          disabled={!file || recognizeMutation.isPending}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {recognizeMutation.isPending ? "Анализируем..." : "Распознать"}
        </button>
        <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-700">
          Закрыть
        </button>
      </div>

      {recognizeMutation.isError && (
        <p className="text-sm text-red-600">
          {recognizeMutation.error instanceof ApiError
            ? recognizeMutation.error.message
            : "Не удалось распознать фото"}
        </p>
      )}

      {result && (
        <div className="space-y-3">
          {result.notes && (
            <p className="text-sm text-neutral-600 bg-neutral-100 rounded-lg px-3 py-2">{result.notes}</p>
          )}
          {result.items.length === 0 ? (
            <p className="text-sm text-neutral-400">Еда на фото не распознана.</p>
          ) : (
            result.items.map((item, index) => (
              <RecognizedItemCard key={index} item={item} photoUrl={result.photo_url} onAdd={onAdd} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
