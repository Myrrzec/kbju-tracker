import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as recommendationsApi from "../lib/api/recommendations";
import { ApiError } from "../lib/apiClient";
import { Skeleton } from "../components/Skeleton";
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
    <div className="max-w-3xl space-y-9 stagger">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[34px] sm:text-[40px] leading-tight font-bold">Advice</h1>
        <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn btn-primary">
          <SparklesIcon /> {generateMutation.isPending ? "Thinking…" : "Refresh advice"}
        </button>
      </div>

      {generateMutation.isError && (
        <p role="alert" className="text-danger animate-fade">
          {generateMutation.error instanceof ApiError ? generateMutation.error.message : "Couldn't get advice"}
        </p>
      )}

      {latestQuery.isLoading && !recommendation && (
        <div className="card space-y-3" aria-hidden="true">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-9/12" />
        </div>
      )}

      {!recommendation && !latestQuery.isLoading && (
        <div className="text-center py-10 px-4 border border-dashed border-line rounded-2xl">
          <p className="font-medium">No advice yet</p>
          <p className="text-sm text-ink-2 mt-1">Press “Refresh advice” and the AI will review your last 7 days.</p>
        </div>
      )}

      {recommendation && (
        <div className="card" key={recommendation.created_at}>
          <p className="whitespace-pre-line leading-relaxed max-w-[68ch]">{recommendation.content}</p>
          <p className="text-[13px] text-ink-2 mt-6">
            Based on the last {recommendation.period_days} days ·{" "}
            {new Date(recommendation.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      )}
    </div>
  );
}
