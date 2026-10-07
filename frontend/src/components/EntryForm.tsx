import { useState, type FormEvent } from "react";
import { MEAL_LABELS } from "../lib/groupMeals";
import type { MealEntryCreatePayload, MealType } from "../types";

export interface EntryFormInitial {
  name?: string;
  meal_type?: MealType;
  grams?: number;
  calories?: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  photo_url?: string | null;
  source?: "manual" | "photo_ai";
}

interface EntryFormProps {
  initial?: EntryFormInitial;
  onSubmit: (payload: MealEntryCreatePayload) => Promise<unknown>;
  onCancel?: () => void;
  submitLabel?: string;
  fixedMealType?: MealType;
}

export function EntryForm({ initial, onSubmit, onCancel, submitLabel = "Add", fixedMealType }: EntryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mealType, setMealType] = useState<MealType>(initial?.meal_type ?? "lunch");
  const [grams, setGrams] = useState(initial?.grams?.toString() ?? "");
  const [calories, setCalories] = useState(initial?.calories?.toString() ?? "");
  const [proteinG, setProteinG] = useState(initial?.protein_g?.toString() ?? "");
  const [fatG, setFatG] = useState(initial?.fat_g?.toString() ?? "");
  const [carbsG, setCarbsG] = useState(initial?.carbs_g?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = {
      name: name.trim(),
      meal_type: fixedMealType ?? mealType,
      grams: Number(grams),
      calories: Number(calories),
      protein_g: Number(proteinG),
      fat_g: Number(fatG),
      carbs_g: Number(carbsG),
    };

    if (!parsed.name || Object.values(parsed).some((v) => typeof v === "number" && Number.isNaN(v))) {
      setError("Enter a name and valid numbers in every field");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...parsed,
        photo_url: initial?.photo_url ?? undefined,
        source: initial?.source ?? "manual",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="label">Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        {!fixedMealType && (
          <label className="block">
            <span className="label">Meal</span>
            <select className="input" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
              {Object.entries(MEAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="label">Portion, g</span>
          <input className="input" inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="block">
          <span className="label !text-cal">Calories</span>
          <input className="input" inputMode="decimal" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </label>
        <label className="block">
          <span className="label !text-protein">Protein, g</span>
          <input className="input" inputMode="decimal" value={proteinG} onChange={(e) => setProteinG(e.target.value)} />
        </label>
        <label className="block">
          <span className="label !text-fat">Fat, g</span>
          <input className="input" inputMode="decimal" value={fatG} onChange={(e) => setFatG(e.target.value)} />
        </label>
        <label className="block">
          <span className="label !text-carbs">Carbs, g</span>
          <input className="input" inputMode="decimal" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger animate-fade">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
