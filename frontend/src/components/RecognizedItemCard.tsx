import { useState } from "react";
import type { MealEntryCreatePayload, MealType, RecognizedFoodItem } from "../types";
import { EntryForm } from "./EntryForm";

const CONFIDENCE_LABELS: Record<string, { label: string; className: string }> = {
  high: { label: "высокая уверенность", className: "bg-brand-50 text-brand-700" },
  medium: { label: "средняя уверенность", className: "bg-amber-50 text-amber-700" },
  low: { label: "низкая уверенность — проверьте вручную", className: "bg-red-50 text-red-700" },
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
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-700">
        «{item.name}» добавлено в дневник
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium">{item.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${confidence.className}`}>{confidence.label}</span>
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
        submitLabel="Добавить в дневник"
        fixedMealType={mealType}
        onSubmit={async (payload) => {
          await onAdd(payload);
          setAdded(true);
        }}
      />
    </div>
  );
}
