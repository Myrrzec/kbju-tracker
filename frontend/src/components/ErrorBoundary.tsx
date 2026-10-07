import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 gap-6 text-center" role="alert">
        <h1 className="text-[28px] font-bold">Something went wrong</h1>
        <p className="text-ink-2 max-w-sm">The app hit an unexpected error. Reloading the page usually fixes it.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}
