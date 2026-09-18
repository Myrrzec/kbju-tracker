export type Sex = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type Goal = "lose_weight" | "maintain" | "gain_weight";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type EntrySource = "manual" | "photo_ai";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Profile {
  name: string | null;
  sex: Sex | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
  target_calories_override: number | null;
  target_protein_g_override: number | null;
  target_fat_g_override: number | null;
  target_carbs_g_override: number | null;
}

export interface ProfileUpdatePayload {
  name?: string | null;
  sex?: Sex | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  activity_level?: ActivityLevel | null;
  goal?: Goal | null;
  target_calories_override?: number | null;
  target_protein_g_override?: number | null;
  target_fat_g_override?: number | null;
  target_carbs_g_override?: number | null;
}

export interface DailyTargets {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  is_estimated: boolean;
}

export interface MealEntry {
  id: string;
  name: string;
  meal_type: MealType;
  source: EntrySource;
  grams: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  photo_url: string | null;
  logged_at: string;
  created_at: string;
}

export interface MealEntryCreatePayload {
  name: string;
  meal_type: MealType;
  grams: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  photo_url?: string | null;
  source?: EntrySource;
  logged_at?: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  entries: MealEntry[];
}

export interface RecognizedFoodItem {
  name: string;
  estimated_grams: number;
  confidence: "high" | "medium" | "low";
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface PhotoRecognitionResult {
  items: RecognizedFoodItem[];
  notes: string | null;
  photo_url: string;
}

export interface Recommendation {
  id: string;
  content: string;
  period_days: number;
  created_at: string;
}

export interface ApiErrorBody {
  detail?: string | { msg: string }[];
}
