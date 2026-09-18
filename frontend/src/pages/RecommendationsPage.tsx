import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as recommendationsApi from "../lib/api/recommendations";
import { ApiError } from "../lib/apiClient";

export function RecommendationsPage() {
  const queryClient = useQueryClient();

  const latestQuery = useQuery({
    queryKey: ["recommendation-latest"],
    queryFn: recommendationsApi.getLatestRecommendation,
  });

  const generateMutation = useMutation({
    mutationFn: () => recommendationsApi.generateRecommendation(7),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendation-latest"] }),
  });

  const recommendation = generateMutation.data ?? latestQuery.data;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Рекомендации</h1>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {generateMutation.isPending ? "Генерируем..." : "Обновить рекомендацию"}
        </button>
      </div>

      {generateMutation.isError && (
        <p className="text-sm text-red-600">
          {generateMutation.error instanceof ApiError ? generateMutation.error.message : "Не удалось получить рекомендацию"}
        </p>
      )}

      {!recommendation && !latestQuery.isLoading && (
        <p className="text-sm text-neutral-400">
          Рекомендаций пока нет — нажмите «Обновить рекомендацию», чтобы получить первую.
        </p>
      )}

      {recommendation && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="whitespace-pre-line text-neutral-800 leading-relaxed">{recommendation.content}</p>
          <p className="text-xs text-neutral-400 mt-4">
            За период: {recommendation.period_days} дн. · {new Date(recommendation.created_at).toLocaleString("ru-RU")}
          </p>
        </div>
      )}
    </div>
  );
}
