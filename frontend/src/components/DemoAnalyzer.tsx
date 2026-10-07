import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as recognitionApi from "../lib/api/recognition";
import { ApiError } from "../lib/apiClient";
import { useDelayedFlag } from "../lib/motion";
import type { RecognizedFoodItem } from "../types";
import { Skeleton } from "./Skeleton";
import { CameraIcon } from "./icons";

const CONFIDENCE: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence, double-check",
};

function DemoItem({ item }: { item: RecognizedFoodItem }) {
  const stats = [
    { value: item.calories, label: "kcal", color: "text-cal" },
    { value: item.protein_g, label: "protein, g", color: "text-protein" },
    { value: item.fat_g, label: "fat, g", color: "text-fat" },
    { value: item.carbs_g, label: "carbs, g", color: "text-carbs" },
  ];

  return (
    <div className="bg-surface-2 border border-line rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{item.name}</p>
        <span className="text-xs px-2.5 py-1 rounded-lg border border-line text-ink-2">
          {CONFIDENCE[item.confidence] ?? CONFIDENCE.medium}
        </span>
      </div>
      <p className="text-sm text-ink-2 mt-1">About {Math.round(item.estimated_grams)} g</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className={`text-2xl font-bold ${stat.color}`}>{Math.round(stat.value)}</p>
            <p className="text-[13px] text-ink-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemoAnalyzer() {
  const [file, setFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const mutation = useMutation({ mutationFn: (f: File) => recognitionApi.recognizeDemo(f) });
  const slow = useDelayedFlag(mutation.isPending, 6000);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    mutation.reset();
  };

  const result = mutation.data;
  const limitReached = mutation.error instanceof ApiError && mutation.error.status === 429;

  return (
    <div className="card !p-6 sm:!p-8 space-y-5">
      <div>
        <h2 className="text-[22px] font-bold">Try it on a photo</h2>
        <p className="text-sm text-ink-2 mt-1">
          No account needed. Your photo is sent to Anthropic for analysis and is not saved.{" "}
          <Link to="/privacy" className="text-ink underline underline-offset-4">
            Privacy Policy
          </Link>
        </p>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        aria-label="Choose a photo of a meal"
        className="block w-full text-sm text-ink-2 file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-xl file:border file:border-line file:bg-surface-2 file:px-[18px] file:text-ink file:transition-colors hover:file:border-ink-3"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview of the selected meal photo"
          className="max-h-64 rounded-xl border border-line animate-fade"
        />
      )}

      <button
        type="button"
        onClick={() => file && mutation.mutate(file)}
        disabled={!file || mutation.isPending}
        className="btn btn-primary"
      >
        <CameraIcon /> {mutation.isPending ? "Analyzing…" : "Analyze photo"}
      </button>

      {mutation.isPending && (
        <div className="space-y-3" aria-live="polite">
          <Skeleton className="h-32" />
          {slow && (
            <p className="text-sm text-ink-2 animate-fade">
              Still working. The server may be waking up (free hosting), which can take up to a minute.
            </p>
          )}
        </div>
      )}

      {mutation.isError && (
        <p role="alert" className="text-sm text-danger animate-fade">
          {mutation.error instanceof ApiError ? mutation.error.message : "Couldn't analyze the photo"}
        </p>
      )}

      {result && (
        <div className="space-y-3 animate-rise">
          {result.notes && (
            <p className="text-sm text-ink-2 bg-surface-2 border border-line rounded-xl px-4 py-3">{result.notes}</p>
          )}
          {result.items.length === 0 ? (
            <p className="text-ink-2">No food found in this photo. Try a clearer shot, ideally from above.</p>
          ) : (
            result.items.map((item, index) => <DemoItem key={index} item={item} />)
          )}
        </div>
      )}

      {(result || limitReached) && (
        <div className="bg-surface-2 border-l-[3px] border-protein rounded-xl px-5 py-5 animate-rise">
          <p className="font-semibold">
            {limitReached ? "Want to keep analyzing meals?" : "Want to log this meal?"}
          </p>
          <p className="text-sm text-ink-2 mt-1 max-w-[56ch]">
            Create a free account to save meals to a diary, follow your daily calorie and macro targets, and get
            advice. Demo results are not saved.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Link to="/register" className="btn btn-primary">
              Create account
            </Link>
            <Link to="/login" className="btn-ghost inline-flex items-center">
              I already have an account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
