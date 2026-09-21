import type { MealEntry, MealType } from "../types";

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

const MANUAL_GAP_MS = 30 * 60 * 1000;

export interface MealGroup {
  key: string;
  label: string;
  startedAt: Date;
  entries: MealEntry[];
  totals: { calories: number; protein_g: number; fat_g: number; carbs_g: number };
}

interface RawGroup {
  key: string;
  mealType: MealType;
  entries: MealEntry[];
}

// Блюда с одного фото — один приём пищи; ручные записи одного типа
// внутри 30 минут друг от друга — тоже один приём.
export function groupIntoMeals(entries: MealEntry[]): MealGroup[] {
  const sorted = [...entries].sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());

  const raw: RawGroup[] = [];
  const photoGroups = new Map<string, RawGroup>();
  const lastManual = new Map<MealType, RawGroup>();

  for (const entry of sorted) {
    if (entry.photo_url) {
      const key = `${entry.meal_type}|${entry.photo_url}`;
      let group = photoGroups.get(key);
      if (!group) {
        group = { key, mealType: entry.meal_type, entries: [] };
        photoGroups.set(key, group);
        raw.push(group);
      }
      group.entries.push(entry);
      continue;
    }

    const prev = lastManual.get(entry.meal_type);
    const prevLast = prev?.entries[prev.entries.length - 1];
    const withinGap =
      prev && prevLast && new Date(entry.logged_at).getTime() - new Date(prevLast.logged_at).getTime() <= MANUAL_GAP_MS;

    if (prev && withinGap) {
      prev.entries.push(entry);
    } else {
      const group: RawGroup = { key: `manual|${entry.id}`, mealType: entry.meal_type, entries: [entry] };
      lastManual.set(entry.meal_type, group);
      raw.push(group);
    }
  }

  const startOf = (g: RawGroup) => new Date(g.entries[0].logged_at).getTime();
  raw.sort((a, b) => startOf(a) - startOf(b));

  const totalPerType = new Map<MealType, number>();
  raw.forEach((g) => totalPerType.set(g.mealType, (totalPerType.get(g.mealType) ?? 0) + 1));
  const seenPerType = new Map<MealType, number>();

  return raw.map((g) => {
    const index = (seenPerType.get(g.mealType) ?? 0) + 1;
    seenPerType.set(g.mealType, index);
    const numbered = (totalPerType.get(g.mealType) ?? 1) > 1;

    return {
      key: g.key,
      label: numbered ? `${MEAL_LABELS[g.mealType]} ${index}` : MEAL_LABELS[g.mealType],
      startedAt: new Date(g.entries[0].logged_at),
      entries: g.entries,
      totals: g.entries.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories,
          protein_g: acc.protein_g + e.protein_g,
          fat_g: acc.fat_g + e.fat_g,
          carbs_g: acc.carbs_g + e.carbs_g,
        }),
        { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0 },
      ),
    };
  });
}
