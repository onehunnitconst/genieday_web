"use client";

import { useState } from "react";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { useNicknameForm } from "@/hooks/use-nickname-form";
import { authClient } from "@/utils/auth-client";

export function useAccount() {
  const user = useCurrentUser();
  const { refetch } = authClient.useSession();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const nicknameForm = useNicknameForm({
    initialValue: user.nickname,
    onSaved: async () => {
      await refetch();
    },
  });

  const openEdit = () => {
    nicknameForm.reset(user.nickname); // 지난번에 입력하다 만 값 대신 지금 닉네임에서 시작한다.
    setIsEditOpen(true);
  };

  const changeEditOpen = (open: boolean) => {
    if (!nicknameForm.isSaving) setIsEditOpen(open);
  };

  const saveNickname = async () => {
    if (await nicknameForm.submit()) setIsEditOpen(false);
  };

  return {
    nickname: user.nickname,
    email: user.email,
    isEditOpen,
    nicknameValue: nicknameForm.value,
    nicknameError: nicknameForm.error,
    isSaving: nicknameForm.isSaving,
    openEdit,
    changeEditOpen,
    changeNickname: nicknameForm.changeValue,
    saveNickname,
  };
}
