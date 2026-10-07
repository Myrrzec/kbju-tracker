import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import { ProfileForm } from "../components/ProfileForm";
import { QueryError } from "../components/QueryError";
import { Skeleton } from "../components/Skeleton";
import { Logo } from "../components/Logo";

export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: usersApi.getProfile });
  const profile = profileQuery.data;

  const mutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      navigate("/");
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-0 py-10 sm:py-14 space-y-9 stagger">
      <Logo />
      <div>
        <h1 className="text-[34px] sm:text-[40px] leading-tight font-bold">Tell us about yourself</h1>
        <p className="text-ink-2 mt-2">We use this to work out your daily calories, protein, fat and carbs.</p>
      </div>
      <div className="card">
        {profileQuery.isError ? (
          <QueryError message="Couldn't load your profile." onRetry={() => profileQuery.refetch()} />
        ) : !profile ? (
          <div className="space-y-5" aria-hidden="true">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        ) : (
          <ProfileForm
            initial={profile}
            onSubmit={(payload) => mutation.mutateAsync(payload)}
            submitLabel="Save and continue"
          />
        )}
      </div>
    </div>
  );
}
