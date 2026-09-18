import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import { ProfileForm } from "../components/ProfileForm";

export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: usersApi.getProfile });

  const mutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      navigate("/");
    },
  });

  if (isLoading || !profile) return <p className="text-neutral-500">Загрузка...</p>;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-1">Расскажите о себе</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Это нужно, чтобы рассчитать вашу суточную норму калорий, белков, жиров и углеводов.
      </p>
      <ProfileForm initial={profile} onSubmit={(payload) => mutation.mutateAsync(payload)} submitLabel="Сохранить и продолжить" />
    </div>
  );
}
