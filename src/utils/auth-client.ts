import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/server/auth";

/** 브라우저에서 쓰는 Better Auth 클라이언트 (같은 오리진의 /api/auth로 요청한다) */
export const authClient = createAuthClient({
  // 서버에 추가한 사용자 필드(nickname)를 세션 타입에 반영한다
  plugins: [inferAdditionalFields<typeof auth>()],
});
