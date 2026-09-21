import { useState, type FormEvent } from "react";
import type { MealEntryCreatePayload, MealType } from "../types";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

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

export function EntryForm({ initial, onSubmit, onCancel, submitLabel = "Добавить", fixedMealType }: EntryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mealType, setMealType] = useState<MealType>(initial?.meal_type ?? "lunch");
  const [grams, setGrams] = useState(initial?.grams?.toString() ?? "");
  const [calories, setCalories] = useState(initial?.calories?.toString() ?? "");
  const [proteinG, setProteinG] = useState(initial?.protein_g?.toString() ?? "");
  const [fatG, setFatG] = useState(initial?.fat_g?.toString() ?? "");
  const [carbsG, setCarbsG] = useState(initial?.carbs_g?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass = "w-full border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:border-brand-500";
  const labelClass = "block text-sm text-neutral-600 mb-1";

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
      setError("Заполните название и числовые поля корректно");
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
      setError(err instanceof Error ? err.message : "Не удалось сохранить запись");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelClass}>Название</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {!fixedMealType && (
        <div>
          <label className={labelClass}>Приём пищи</label>
          <select className={inputClass} value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
            {Object.entries(MEAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        )}
        <div>
          <label className={labelClass}>Вес порции, г</label>
          <input className={inputClass} value={grams} onChange={(e) => setGrams(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>Ккал</label>
          <input className={inputClass} value={calories} onChange={(e) => setCalories(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Белки</label>
          <input className={inputClass} value={proteinG} onChange={(e) => setProteinG(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Жиры</label>
          <input className={inputClass} value={fatG} onChange={(e) => setFatG(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Углеводы</label>
          <input className={inputClass} value={carbsG} onChange={(e) => setCarbsG(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Сохраняем..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-neutral-500 hover:text-neutral-700 px-2">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
