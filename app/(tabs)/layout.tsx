import type { ReactNode } from "react";
import { AuthGateContainer } from "@/features/auth/auth-gate-container";
import { TabLayout } from "@/layouts/tab-layout";

/** 로그인해야 들어올 수 있는 탭 화면들. 로그인·닉네임 설정 화면에는 헤더와 탭바를 붙이지 않는다. */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGateContainer fallback={<TabLayout />}>
      <TabLayout>{children}</TabLayout>
    </AuthGateContainer>
  );
}
