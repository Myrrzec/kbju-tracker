import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import { ProfileForm } from "../components/ProfileForm";
import { useAuth } from "../context/AuthContext";
import { LogOutIcon } from "../components/icons";

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: usersApi.getProfile });

  const mutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading || !profile) return <p className="text-ink-2">Загрузка...</p>;

  return (
    <div className="max-w-2xl space-y-9">
      <h1 className="text-[40px] leading-tight font-bold">Профиль</h1>
      <div className="card">
        {saved && (
          <p className="mb-6 bg-surface-2 border-l-[3px] border-protein rounded-xl px-5 py-3 text-ink-2" role="status">
            Сохранено
          </p>
        )}
        <ProfileForm
          initial={profile}
          onSubmit={(payload) => mutation.mutateAsync(payload)}
          submitLabel="Сохранить"
          extraAction={
            <button type="button" onClick={logout} className="btn btn-secondary">
              <LogOutIcon /> Выйти из аккаунта
            </button>
          }
        />
      </div>
    </div>
  );
}
