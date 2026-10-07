import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import { ProfileForm } from "../components/ProfileForm";
import { AccountData } from "../components/AccountData";
import { QueryError } from "../components/QueryError";
import { Skeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { LogOutIcon } from "../components/icons";

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [saved, setSaved] = useState(false);

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: usersApi.getProfile });
  const profile = profileQuery.data;

  const mutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <div className="max-w-2xl space-y-9 stagger">
      <h1 className="text-[34px] sm:text-[40px] leading-tight font-bold">Profile</h1>
      <div className="card">
        {saved && (
          <p
            className="mb-6 bg-surface-2 border-l-[3px] border-protein rounded-xl px-5 py-3 text-ink-2 animate-rise"
            role="status"
          >
            Saved
          </p>
        )}
        {profileQuery.isError ? (
          <QueryError message="Couldn't load your profile." onRetry={() => profileQuery.refetch()} />
        ) : !profile ? (
          <div className="space-y-5" aria-hidden="true">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        ) : (
          <ProfileForm
            initial={profile}
            onSubmit={(payload) => mutation.mutateAsync(payload)}
            submitLabel="Save"
            extraAction={
              <button type="button" onClick={logout} className="btn btn-secondary">
                <LogOutIcon /> Sign out
              </button>
            }
          />
        )}
      </div>
      <AccountData />
    </div>
  );
}
