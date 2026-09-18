import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../lib/api/users";
import { ProfileForm } from "../components/ProfileForm";

export function ProfilePage() {
  const queryClient = useQueryClient();
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

  if (isLoading || !profile) return <p className="text-neutral-500">Загрузка...</p>;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-6">Профиль</h1>
      {saved && <p className="text-sm text-brand-700 bg-brand-50 rounded-lg px-3 py-2 mb-4">Сохранено</p>}
      <ProfileForm initial={profile} onSubmit={(payload) => mutation.mutateAsync(payload)} submitLabel="Сохранить" />
    </div>
  );
}
