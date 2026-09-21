import { useState, type FormEvent, type ReactNode } from "react";
import type { ActivityLevel, Goal, Profile, ProfileUpdatePayload, Sex } from "../types";

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Сидячий образ жизни",
  light: "Лёгкая активность (1-3 раза в неделю)",
  moderate: "Умеренная активность (3-5 раз в неделю)",
  active: "Высокая активность (6-7 раз в неделю)",
  very_active: "Очень высокая активность / физическая работа",
};

const GOAL_LABELS: Record<Goal, string> = {
  lose_weight: "Похудение",
  maintain: "Поддержание веса",
  gain_weight: "Набор массы",
};

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

interface ProfileFormProps {
  initial: Profile;
  onSubmit: (payload: ProfileUpdatePayload) => Promise<unknown>;
  submitLabel: string;
  extraAction?: ReactNode;
}

export function ProfileForm({ initial, onSubmit, submitLabel, extraAction }: ProfileFormProps) {
  const [name, setName] = useState(initial.name ?? "");
  const [sex, setSex] = useState<Sex | "">(initial.sex ?? "");
  const [birthDate, setBirthDate] = useState(initial.birth_date ? initial.birth_date.slice(0, 10) : "");
  const [heightCm, setHeightCm] = useState(initial.height_cm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initial.weight_kg?.toString() ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">(initial.activity_level ?? "");
  const [goal, setGoal] = useState<Goal | "">(initial.goal ?? "");
  const [showOverrides, setShowOverrides] = useState(
    initial.target_calories_override !== null && initial.target_calories_override !== undefined,
  );
  const [calOverride, setCalOverride] = useState(initial.target_calories_override?.toString() ?? "");
  const [proteinOverride, setProteinOverride] = useState(initial.target_protein_g_override?.toString() ?? "");
  const [fatOverride, setFatOverride] = useState(initial.target_fat_g_override?.toString() ?? "");
  const [carbsOverride, setCarbsOverride] = useState(initial.target_carbs_g_override?.toString() ?? "");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        name: name || null,
        sex: sex || null,
        birth_date: birthDate || null,
        height_cm: toNumberOrNull(heightCm),
        weight_kg: toNumberOrNull(weightKg),
        activity_level: activityLevel || null,
        goal: goal || null,
        target_calories_override: showOverrides ? toNumberOrNull(calOverride) : null,
        target_protein_g_override: showOverrides ? toNumberOrNull(proteinOverride) : null,
        target_fat_g_override: showOverrides ? toNumberOrNull(fatOverride) : null,
        target_carbs_g_override: showOverrides ? toNumberOrNull(carbsOverride) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить профиль");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input";
  const labelClass = "label";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Имя</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Пол</label>
          <select className={inputClass} value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
            <option value="">Не указано</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Дата рождения</label>
          <input
            type="date"
            className={inputClass}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Рост, см</label>
          <input
            type="number"
            className={inputClass}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Вес, кг</label>
          <input
            type="number"
            step="0.1"
            className={inputClass}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Уровень активности</label>
        <select
          className={inputClass}
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
        >
          <option value="">Не указано</option>
          {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Цель</label>
        <select className={inputClass} value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
          <option value="">Не указано</option>
          {Object.entries(GOAL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-line-soft pt-6">
        <label className="flex items-center gap-3 text-ink">
          <input type="checkbox" className="size-4 accent-[#C8FF4D]" checked={showOverrides} onChange={(e) => setShowOverrides(e.target.checked)} />
          Задать целевые КБЖУ вручную (вместо автоматического расчёта)
        </label>

        {showOverrides && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Калории</label>
              <input className={inputClass} value={calOverride} onChange={(e) => setCalOverride(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Белки, г</label>
              <input
                className={inputClass}
                value={proteinOverride}
                onChange={(e) => setProteinOverride(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Жиры, г</label>
              <input className={inputClass} value={fatOverride} onChange={(e) => setFatOverride(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Углеводы, г</label>
              <input
                className={inputClass}
                value={carbsOverride}
                onChange={(e) => setCarbsOverride(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Сохраняем..." : submitLabel}
      </button>
        {extraAction}
      </div>
    </form>
  );
}
