import { useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as recognitionApi from "../lib/api/recognition";
import * as diaryApi from "../lib/api/diary";
import { todayStr } from "../lib/date";
import { RecognizedItemCard } from "../components/RecognizedItemCard";
import { ApiError } from "../lib/apiClient";

export function RecognizePage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const recognizeMutation = useMutation({
    mutationFn: (f: File) => recognitionApi.recognizePhoto(f),
  });

  const createMutation = useMutation({
    mutationFn: diaryApi.createEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary-summary", todayStr()] }),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
    recognizeMutation.reset();
  };

  const handleAnalyze = () => {
    if (file) recognizeMutation.mutate(file);
  };

  const result = recognizeMutation.data;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold mb-1">Распознать еду по фото</h1>
        <p className="text-sm text-neutral-500">
          Загрузите фото блюда — AI оценит состав и КБЖУ. Перед добавлением в дневник можно поправить граммовку и цифры.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />

        {previewUrl && (
          <img src={previewUrl} alt="Предпросмотр фото" className="max-h-64 rounded-xl border border-neutral-200" />
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || recognizeMutation.isPending}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {recognizeMutation.isPending ? "Анализируем..." : "Распознать"}
        </button>

        {recognizeMutation.isError && (
          <p className="text-sm text-red-600">
            {recognizeMutation.error instanceof ApiError
              ? recognizeMutation.error.message
              : "Не удалось распознать фото"}
          </p>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          {result.notes && (
            <p className="text-sm text-neutral-500 bg-neutral-100 rounded-lg px-3 py-2">{result.notes}</p>
          )}

          {result.items.length === 0 ? (
            <p className="text-sm text-neutral-400">Еда на фото не распознана.</p>
          ) : (
            result.items.map((item, index) => (
              <RecognizedItemCard
                key={index}
                item={item}
                photoUrl={result.photo_url}
                onAdd={(payload) => createMutation.mutateAsync(payload)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
