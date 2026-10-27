import type { NotificationKind } from "@/types/notification";

export const NOTIFICATION_KIND_LABELS: Record<
  NotificationKind,
  { title: string; description: string }
> = {
  period: { title: "생리 예정일", description: "예정일 이틀 전에 알려드려요." },
  fertile: { title: "가임기 시작", description: "가임기가 시작되는 날 알려드려요." },
  pms: { title: "PMS 시기", description: "예정일 일주일 전, PMS 시기가 시작될 때 알려드려요." },
};
