/** 알림 종류. prisma NotificationPreference의 Boolean 열 이름과 같다. */
export const NOTIFICATION_KINDS = ["period", "fertile", "pms"] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type NotificationPreferences = Record<NotificationKind, boolean>;

/** 아직 한 번도 바꾸지 않은 사용자의 설정 (prisma 스키마의 @default와 같다) */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  period: true,
  fertile: false,
  pms: false,
};

/** 브라우저 PushSubscription.toJSON()에서 서버에 저장하는 부분 */
export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};
