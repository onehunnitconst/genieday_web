import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getUserId } from "@/server/auth";
import { prisma } from "@/server/db";
import { nicknameSchema } from "@/utils/nickname";

export async function PATCH(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = nicknameSchema.safeParse((body as { nickname?: unknown } | null)?.nickname);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error).formErrors[0] ?? "닉네임이 올바르지 않아요." },
      { status: 400 },
    );
  }

  await prisma.user.update({ where: { id: userId }, data: { nickname: parsed.data } });
  return NextResponse.json({ nickname: parsed.data });
}
