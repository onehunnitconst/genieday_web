"use client";

import type { ReactNode } from "react";
import { useNicknameForm } from "@/hooks/use-nickname-form";
import { CurrentUserProvider } from "./current-user-context";
import { NicknameSetupView } from "./nickname-setup-view";
import { SignInView } from "./sign-in-view";
import { signOut, useAuth } from "./use-auth";

type AuthGateContainerProps = {
  /** 세션을 확인하는 동안 보여줄 화면 */
  fallback: ReactNode;
  children: ReactNode;
};

/**
 * 로그인하지 않았으면 로그인 화면을, 닉네임이 없으면(가입 직후) 닉네임 설정 화면을,
 * 둘 다 갖췄으면 children을 보여준다.
 */
export function AuthGateContainer({ fallback, children }: AuthGateContainerProps) {
  const vm = useAuth();
  const nicknameForm = useNicknameForm({ onSaved: vm.refreshSession });

  switch (vm.status.kind) {
    case "pending":
      return fallback;
    case "signed-out":
      return (
        <SignInView
          isSigningIn={vm.isSigningIn}
          errorMessage={vm.signInError}
          onSignInWithGoogle={vm.signInWithGoogle}
        />
      );
    case "needs-nickname":
      return (
        <NicknameSetupView
          googleName={vm.status.googleName}
          value={nicknameForm.value}
          error={nicknameForm.error}
          isSaving={nicknameForm.isSaving}
          onChange={nicknameForm.changeValue}
          onSubmit={nicknameForm.submit}
          onCancel={signOut}
        />
      );
    case "signed-in":
      return <CurrentUserProvider user={vm.status.user}>{children}</CurrentUserProvider>;
  }
}
