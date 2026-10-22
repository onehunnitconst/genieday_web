import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./db";

// Google 콘솔에 등록한 리디렉션 URI: {BETTER_AUTH_URL}/api/auth/callback/google
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  user: {
    additionalFields: {
      // 세션에 실어 보내기만 하고, 변경은 검증을 거치는 PATCH /api/me/nickname으로만 받는다
      nickname: { type: "string", required: false, input: false },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});

/** 요청 헤더의 세션 쿠키로 로그인한 사용자 ID를 찾는다. 로그인하지 않았으면 null. */
export async function getUserId(headers: Headers): Promise<string | null> {
  const session = await auth.api.getSession({ headers });
  return session?.user.id ?? null;
}
