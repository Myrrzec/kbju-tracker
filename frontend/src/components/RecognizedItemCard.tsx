import { useState } from "react";
import type { MealEntryCreatePayload, MealType, RecognizedFoodItem } from "../types";
import { EntryForm } from "./EntryForm";

const CONFIDENCE_LABELS: Record<string, { label: string; className: string }> = {
  high: { label: "High confidence", className: "text-ink-2 border-line" },
  medium: { label: "Medium confidence", className: "text-ink-2 border-line" },
  low: { label: "Low confidence, double-check", className: "text-ink border-ink-3" },
};

interface RecognizedItemCardProps {
  item: RecognizedFoodItem;
  photoUrl: string;
  onAdd: (payload: MealEntryCreatePayload) => Promise<unknown>;
  mealType: MealType;
}

export function RecognizedItemCard({ item, photoUrl, onAdd, mealType }: RecognizedItemCardProps) {
  const [added, setAdded] = useState(false);
  const confidence = CONFIDENCE_LABELS[item.confidence] ?? CONFIDENCE_LABELS.medium;

  if (added) {
    return (
      <div className="bg-surface-2 border-l-[3px] border-protein rounded-xl px-5 py-4 text-ink-2 animate-fade">
        “{item.name}” added to your diary
      </div>
    );
  }

  return (
    <div className="bg-surface-2 border border-line rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="font-semibold">{item.name}</p>
        <span className={`text-xs px-2.5 py-1 rounded-lg border ${confidence.className}`}>{confidence.label}</span>
      </div>
      <EntryForm
        initial={{
          name: item.name,
          grams: item.estimated_grams,
          calories: item.calories,
          protein_g: item.protein_g,
          fat_g: item.fat_g,
          carbs_g: item.carbs_g,
          photo_url: photoUrl,
          source: "photo_ai",
        }}
        submitLabel="Add to diary"
        fixedMealType={mealType}
        onSubmit={async (payload) => {
          await onAdd(payload);
          setAdded(true);
        }}
      />
    </div>
  );
}
