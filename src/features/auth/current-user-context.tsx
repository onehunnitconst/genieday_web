"use client";

import { createContext, use, type ReactNode } from "react";

export type CurrentUser = {
  id: string;
  nickname: string;
  email: string;
};

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  return <CurrentUserContext value={user}>{children}</CurrentUserContext>;
}

/** 로그인한 사용자. AuthGateContainer 안에서만 쓸 수 있다. */
export function useCurrentUser(): CurrentUser {
  const user = use(CurrentUserContext);
  if (!user) throw new Error("useCurrentUser는 AuthGateContainer 안에서만 쓸 수 있습니다.");
  return user;
}
