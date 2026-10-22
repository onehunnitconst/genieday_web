"use client";

import { AccountView } from "./account-view";
import { useAccount } from "./use-account";

/** 닉네임 표시·수정과 로그아웃. AuthGateContainer 안에서만 쓸 수 있다. */
export function AccountContainer() {
  const vm = useAccount();

  return (
    <AccountView
      nickname={vm.nickname}
      isEditOpen={vm.isEditOpen}
      nicknameValue={vm.nicknameValue}
      nicknameError={vm.nicknameError}
      isSaving={vm.isSaving}
      onOpenEdit={vm.openEdit}
      onEditOpenChange={vm.changeEditOpen}
      onNicknameChange={vm.changeNickname}
      onSaveNickname={vm.saveNickname}
      onSignOut={vm.signOut}
    />
  );
}
