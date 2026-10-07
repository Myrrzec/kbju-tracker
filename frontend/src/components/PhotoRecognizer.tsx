import { useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import * as recognitionApi from "../lib/api/recognition";
import { ApiError } from "../lib/apiClient";
import { MEAL_LABELS } from "../lib/groupMeals";
import { useDelayedFlag } from "../lib/motion";
import type { MealEntryCreatePayload, MealType } from "../types";
import { RecognizedItemCard } from "./RecognizedItemCard";
import { Skeleton } from "./Skeleton";
import { CameraIcon } from "./icons";

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
  const slow = useDelayedFlag(recognizeMutation.isPending, 6000);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
    recognizeMutation.reset();
  };

  const result = recognizeMutation.data;

  return (
    <div className="space-y-5">
      <p className="text-ink-2">
        Upload a photo of your meal and the AI will estimate what's in it. You can adjust the grams and numbers before
        adding.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-ink-2 file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-xl file:border file:border-line file:bg-surface-2 file:px-[18px] file:text-ink file:transition-colors hover:file:border-ink-3"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview of the selected meal photo"
          className="max-h-64 rounded-xl border border-line animate-fade"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => file && recognizeMutation.mutate(file)}
          disabled={!file || recognizeMutation.isPending}
          className="btn btn-primary"
        >
          <CameraIcon /> {recognizeMutation.isPending ? "Analyzing…" : "Analyze photo"}
        </button>
        <button onClick={onClose} className="btn-ghost">
          Close
        </button>
      </div>

      {recognizeMutation.isPending && (
        <div className="space-y-3" aria-live="polite">
          <Skeleton className="h-40" />
          {slow && (
            <p className="text-sm text-ink-2 animate-fade">
              Still working. The server may be waking up (free hosting), which can take up to a minute.
            </p>
          )}
        </div>
      )}

      {recognizeMutation.isError && (
        <p role="alert" className="text-sm text-danger animate-fade">
          {recognizeMutation.error instanceof ApiError ? recognizeMutation.error.message : "Couldn't analyze the photo"}
        </p>
      )}

      {result && (
        <div className="space-y-3">
          {result.items.length > 0 && (
            <div className="flex items-center gap-3 animate-fade">
              <label className="text-sm text-ink-2" htmlFor="photo-meal-type">
                Meal for all dishes:
              </label>
              <select
                id="photo-meal-type"
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
            <p className="text-sm text-ink-2 bg-surface-2 border border-line rounded-xl px-4 py-3 animate-fade">
              {result.notes}
            </p>
          )}
          {result.items.length === 0 ? (
            <p className="text-ink-2 animate-fade">No food found in this photo. Try a clearer shot, ideally from above.</p>
          ) : (
            result.items.map((item, index) => (
              <div key={index} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}>
                <RecognizedItemCard item={item} photoUrl={result.photo_url} onAdd={onAdd} mealType={mealType} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
