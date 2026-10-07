interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({ message = "Couldn't load this.", onRetry }: QueryErrorProps) {
  return (
    <div
      role="alert"
      className="card !p-5 sm:!p-6 flex flex-wrap items-center justify-between gap-4 !border-danger/30 animate-fade"
    >
      <p className="text-ink-2">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}
