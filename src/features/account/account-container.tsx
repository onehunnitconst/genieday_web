"use client";

import { AccountView } from "./account-view";
import { useAccount } from "./use-account";

/** 프로필(닉네임·이메일)과 닉네임 수정. AuthGateContainer 안에서만 쓸 수 있다. */
export function AccountContainer() {
  const vm = useAccount();

  return (
    <AccountView
      nickname={vm.nickname}
      email={vm.email}
      isEditOpen={vm.isEditOpen}
      nicknameValue={vm.nicknameValue}
      nicknameError={vm.nicknameError}
      isSaving={vm.isSaving}
      onOpenEdit={vm.openEdit}
      onEditOpenChange={vm.changeEditOpen}
      onNicknameChange={vm.changeNickname}
      onSaveNickname={vm.saveNickname}
    />
  );
}
