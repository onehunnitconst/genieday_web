"use client";

import { useState } from "react";
import { authClient } from "@/utils/auth-client";
import type { CurrentUser } from "./current-user-context";

export type AuthStatus =
  | { kind: "pending" }
  | { kind: "signed-out" }
  /** Google 로그인은 했지만 아직 닉네임을 정하지 않음 (가입 직후) */
  | { kind: "needs-nickname"; googleName: string }
  | { kind: "signed-in"; user: CurrentUser };

export function useAuth() {
  const { data, isPending, refetch } = authClient.useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  let status: AuthStatus;
  if (isPending) status = { kind: "pending" };
  else if (!data) status = { kind: "signed-out" };
  else if (!data.user.nickname) status = { kind: "needs-nickname", googleName: data.user.name };
  else {
    status = {
      kind: "signed-in",
      user: { id: data.user.id, nickname: data.user.nickname, email: data.user.email },
    };
  }

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    // 성공하면 Google 로그인 페이지로 이동하므로, 여기로 돌아오는 건 실패했을 때뿐이다.
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    if (error) {
      setSignInError("로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsSigningIn(false);
    }
  };

  /** 서버에서 바뀐 사용자 정보(닉네임 등)를 세션에 다시 불러온다. */
  const refreshSession = async () => {
    await refetch();
  };

  return { status, isSigningIn, signInError, signInWithGoogle, refreshSession };
}

export const signOut = () => authClient.signOut();
