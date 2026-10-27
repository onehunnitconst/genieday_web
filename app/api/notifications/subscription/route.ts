import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getUserId } from "@/server/auth";
import {
  deletePushSubscription,
  pushSubscriptionSchema,
  savePushSubscription,
} from "@/server/notifications";

const unauthorized = () =>
  NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

const invalid = () =>
  NextResponse.json({ error: "구독 정보 형식이 올바르지 않습니다." }, { status: 400 });

/** 이 기기의 웹 푸시 구독을 저장한다. */
export async function PUT(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  const body: unknown = await request.json().catch(() => null);
  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) return invalid();

  await savePushSubscription(userId, parsed.data);
  return new NextResponse(null, { status: 204 });
}

/** 이 기기의 웹 푸시 구독을 지운다. */
export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  const body: unknown = await request.json().catch(() => null);
  const parsed = z.object({ endpoint: z.string().max(2048) }).safeParse(body);
  if (!parsed.success) return invalid();

  await deletePushSubscription(userId, parsed.data.endpoint);
  return new NextResponse(null, { status: 204 });
}
