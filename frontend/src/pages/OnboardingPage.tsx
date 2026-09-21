import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import { ProfileForm } from "../components/ProfileForm";
import { Logo } from "../components/Logo";

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

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-0 py-10 sm:py-14 space-y-9">
      <Logo />
      <div>
        <h1 className="text-[40px] leading-tight font-bold">Расскажите о себе</h1>
        <p className="text-ink-2 mt-2">
          Это нужно, чтобы рассчитать вашу суточную норму калорий, белков, жиров и углеводов.
        </p>
      </div>
      <div className="card">
        {isLoading || !profile ? (
          <p className="text-ink-2">Загрузка...</p>
        ) : (
          <ProfileForm
            initial={profile}
            onSubmit={(payload) => mutation.mutateAsync(payload)}
            submitLabel="Сохранить и продолжить"
          />
        )}
      </div>
    </div>
  );
}
