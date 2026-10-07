import { useState, type FormEvent, type ReactNode } from "react";
import type { ActivityLevel, Goal, Profile, ProfileUpdatePayload, Sex } from "../types";

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Light activity (1-3 times a week)",
  moderate: "Moderate activity (3-5 times a week)",
  active: "High activity (6-7 times a week)",
  very_active: "Very high activity / physical job",
};

const GOAL_LABELS: Record<Goal, string> = {
  lose_weight: "Lose weight",
  maintain: "Maintain weight",
  gain_weight: "Gain weight",
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
      setError(err instanceof Error ? err.message : "Couldn't save your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="label">Name</span>
        <input className="input" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="label">Sex</span>
          <select className="input" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className="block">
          <span className="label">Date of birth</span>
          <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="label">Height, cm</span>
          <input type="number" className="input" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Weight, kg</span>
          <input
            type="number"
            step="0.1"
            className="input"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="label">Activity level</span>
        <select
          className="input"
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
        >
          <option value="">Not specified</option>
          {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Goal</span>
        <select className="input" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
          <option value="">Not specified</option>
          {Object.entries(GOAL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="border-t border-line-soft pt-6">
        <label className="flex items-center gap-3 text-ink cursor-pointer">
          <input
            type="checkbox"
            className="size-4 accent-[#C8FF4D]"
            checked={showOverrides}
            onChange={(e) => setShowOverrides(e.target.checked)}
          />
          Set daily targets manually (instead of the automatic calculation)
        </label>

        {showOverrides && (
          <div className="grid grid-cols-2 gap-4 mt-4 animate-rise">
            <label className="block">
              <span className="label">Calories</span>
              <input
                className="input"
                inputMode="decimal"
                value={calOverride}
                onChange={(e) => setCalOverride(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Protein, g</span>
              <input
                className="input"
                inputMode="decimal"
                value={proteinOverride}
                onChange={(e) => setProteinOverride(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Fat, g</span>
              <input
                className="input"
                inputMode="decimal"
                value={fatOverride}
                onChange={(e) => setFatOverride(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Carbs, g</span>
              <input
                className="input"
                inputMode="decimal"
                value={carbsOverride}
                onChange={(e) => setCarbsOverride(e.target.value)}
              />
            </label>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-danger animate-fade">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving…" : submitLabel}
        </button>
        {extraAction}
      </div>
    </form>
  );
}
