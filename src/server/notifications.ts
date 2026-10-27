import "server-only";

import { z } from "zod";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
  type PushSubscriptionInput,
} from "@/types/notification";
import { prisma } from "./db";

// 지금은 설정과 구독을 저장만 한다. 실제 발송(예정일 등을 계산해 web-push로 보내기)은
// VAPID_PRIVATE_KEY로 서명하는 별도 작업이 맡는다.

export const notificationPreferencesSchema = z
  .object({ period: z.boolean(), fertile: z.boolean(), pms: z.boolean() })
  .partial();

export const pushSubscriptionSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }).max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(256),
    auth: z.string().min(1).max(256),
  }),
}) satisfies z.ZodType<PushSubscriptionInput>;

const selectPreferences = { period: true, fertile: true, pms: true } as const;

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const row = await prisma.notificationPreference.findUnique({
    where: { userId },
    select: selectPreferences,
  });
  return row ?? DEFAULT_NOTIFICATION_PREFERENCES;
}

/** 보낸 항목만 바꾸고 바뀐 전체 설정을 돌려준다. */
export async function updateNotificationPreferences(
  userId: string,
  changes: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...DEFAULT_NOTIFICATION_PREFERENCES, ...changes },
    update: changes,
    select: selectPreferences,
  });
}

/**
 * 이 기기의 구독을 저장한다. 같은 endpoint가 다른 계정에 묶여 있었다면
 * (같은 브라우저에서 계정을 바꾼 경우) 지금 계정으로 옮긴다.
 */
export async function savePushSubscription(userId: string, input: PushSubscriptionInput) {
  const data = { userId, p256dh: input.keys.p256dh, auth: input.keys.auth };
  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: { endpoint: input.endpoint, ...data },
    update: data,
  });
}

/** 이 사용자의 구독만 지운다. (다른 계정의 구독은 endpoint를 알아도 지울 수 없다) */
export async function deletePushSubscription(userId: string, endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
}
