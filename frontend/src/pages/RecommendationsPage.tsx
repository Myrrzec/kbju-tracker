import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as recommendationsApi from "../lib/api/recommendations";
import { ApiError } from "../lib/apiClient";
import { SparklesIcon } from "../components/icons";

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
    <div className="max-w-3xl space-y-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[40px] leading-tight font-bold">Рекомендации</h1>
        <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn btn-primary">
          <SparklesIcon /> {generateMutation.isPending ? "Генерируем..." : "Обновить рекомендацию"}
        </button>
      </div>

      {generateMutation.isError && (
        <p className="text-danger">
          {generateMutation.error instanceof ApiError ? generateMutation.error.message : "Не удалось получить рекомендацию"}
        </p>
      )}

      {!recommendation && !latestQuery.isLoading && (
        <p className="text-ink-2">Рекомендаций пока нет — нажмите «Обновить рекомендацию», чтобы получить первую.</p>
      )}

      {recommendation && (
        <div className="card">
          <p className="whitespace-pre-line leading-relaxed">{recommendation.content}</p>
          <p className="text-[13px] text-ink-2 mt-6">
            За период: {recommendation.period_days} дн. · {new Date(recommendation.created_at).toLocaleString("ru-RU")}
          </p>
        </div>
      )}
    </div>
  );
}
