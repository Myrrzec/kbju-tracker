import { useState, type FormEvent } from "react";
import * as usersApi from "../lib/api/users";
import { useAuth } from "../context/AuthContext";
import { todayStr } from "../lib/date";

export function AccountData() {
  const { logout } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const data = await usersApi.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `macros-tracker-data-${todayStr()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Couldn't export your data");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (event: FormEvent) => {
    event.preventDefault();
    setDeleteError(null);
    setDeleting(true);
    try {
      await usersApi.deleteAccount(password);
      logout();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn't delete the account");
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setConfirming(false);
    setPassword("");
    setDeleteError(null);
  };

  return (
    <section className="card" aria-labelledby="your-data-title">
      <h2 id="your-data-title" className="text-[22px] font-bold mb-6">
        Your data
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-md">
          <p className="font-medium">Download my data</p>
          <p className="text-sm text-ink-2 mt-1">
            A JSON file with your account, profile, diary entries and advice. Photos are not included.
          </p>
        </div>
        <button type="button" onClick={handleExport} disabled={exporting} className="btn btn-secondary">
          {exporting ? "Preparing…" : "Download"}
        </button>
      </div>
      {exportError && (
        <p role="alert" className="text-sm text-danger mt-3 animate-fade">
          {exportError}
        </p>
      )}

      <div className="border-t border-line-soft mt-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <p className="font-medium">Delete account</p>
            <p className="text-sm text-ink-2 mt-1">
              Permanently removes your account, profile, diary, advice and photos. This cannot be undone.
            </p>
          </div>
          {!confirming && (
            <button type="button" onClick={() => setConfirming(true)} className="btn btn-danger">
              Delete account
            </button>
          )}
        </div>

        {confirming && (
          <form onSubmit={handleDelete} className="mt-5 space-y-4 animate-rise">
            <label className="block">
              <span className="label">Enter your password to confirm</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </label>
            {deleteError && (
              <p role="alert" className="text-sm text-danger animate-fade">
                {deleteError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={deleting || !password} className="btn btn-danger">
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
              <button type="button" onClick={cancelDelete} disabled={deleting} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
