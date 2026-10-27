import { NextResponse, type NextRequest } from "next/server";
import { getUserId } from "@/server/auth";
import {
  getNotificationPreferences,
  notificationPreferencesSchema,
  updateNotificationPreferences,
} from "@/server/notifications";

const unauthorized = () =>
  NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

export async function GET(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  return NextResponse.json({ preferences: await getNotificationPreferences(userId) });
}

/** 알림 종류별 켜기/끄기. 보낸 항목만 바뀐다. */
export async function PATCH(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  const body: unknown = await request.json().catch(() => null);
  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "알림 설정 형식이 올바르지 않습니다." }, { status: 400 });
  }

  return NextResponse.json({
    preferences: await updateNotificationPreferences(userId, parsed.data),
  });
}
