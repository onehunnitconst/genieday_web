"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  NOTIFICATION_KINDS,
  type NotificationKind,
  type NotificationPreferences,
} from "@/types/notification";
import { NOTIFICATION_KIND_LABELS } from "./constants";
import { decodeBase64Url, detectPushSupport, type PushSupport } from "./utils/push";

const ENDPOINT = "/api/notifications";
const SUBSCRIPTION_ENDPOINT = `${ENDPOINT}/subscription`;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export type NotificationKindItem = {
  kind: NotificationKind;
  title: string;
  description: string;
  checked: boolean;
};

export type NotificationSettingsState =
  | { kind: "loading" }
  | { kind: "needs-install" }
  | { kind: "unsupported" }
  | { kind: "load-failed" }
  | {
      kind: "ready";
      /** 이 기기에서 푸시를 받고 있는지 */
      isDeviceEnabled: boolean;
      /** 브라우저 설정에서 알림을 막아 둔 상태 (앱에서 다시 물어볼 수 없다) */
      isPermissionDenied: boolean;
      items: NotificationKindItem[];
    };

const subscribeNoop = () => () => {};

const fetchPreferences = async (): Promise<NotificationPreferences> => {
  const response = await fetch(ENDPOINT, { cache: "no-store" });
  if (!response.ok) throw new Error(`알림 설정을 불러오지 못했습니다. (${response.status})`);
  return ((await response.json()) as { preferences: NotificationPreferences }).preferences;
};

const saveSubscription = async (subscription: PushSubscription) => {
  const response = await fetch(SUBSCRIPTION_ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error(`구독을 저장하지 못했습니다. (${response.status})`);
};

/** 이 기기의 구독. 알림 권한이 없으면 구독이 남아 있어도 받지 못하므로 없는 것으로 본다. */
const readDeviceSubscription = async () => {
  if (Notification.permission !== "granted") return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
};

export function useNotificationSettings() {
  // 서버 렌더링 중에는 브라우저 기능을 알 수 없으므로 null(확인 중)이다.
  const support = useSyncExternalStore<PushSupport | null>(
    subscribeNoop,
    detectPushSupport,
    () => null,
  );

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isDeviceEnabled, setIsDeviceEnabled] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (support !== "supported") return;
    let ignore = false;

    fetchPreferences().then(
      (next) => {
        if (!ignore) setPreferences(next);
      },
      (cause: unknown) => {
        console.error(cause);
        if (!ignore) setError("알림 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      },
    );

    readDeviceSubscription().then(
      (subscription) => {
        if (ignore) return;
        setPermission(Notification.permission);
        setIsDeviceEnabled(subscription !== null);
        // 같은 기기에서 계정을 바꿨을 수도 있으니 지금 계정으로 다시 저장해 둔다.
        if (subscription) saveSubscription(subscription).catch(console.error);
      },
      (cause: unknown) => {
        console.error(cause);
        if (!ignore) setIsDeviceEnabled(false);
      },
    );

    return () => {
      ignore = true;
    };
  }, [support]);

  const enableDevice = async () => {
    if (!VAPID_PUBLIC_KEY) {
      setError("알림 서버 설정(VAPID 키)이 아직 되어 있지 않아요.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") {
      setError("알림이 허용되지 않았어요. 브라우저 설정에서 지니데이 알림을 허용해 주세요.");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeBase64Url(VAPID_PUBLIC_KEY),
    });
    await saveSubscription(subscription);
    setIsDeviceEnabled(true);
  };

  const disableDevice = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      // 서버에서 먼저 지워야 실패해도 발송 대상에 끊긴 구독이 남지 않는다.
      const response = await fetch(SUBSCRIPTION_ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      if (!response.ok) throw new Error(`구독을 지우지 못했습니다. (${response.status})`);
      await subscription.unsubscribe();
    }
    setIsDeviceEnabled(false);
  };

  const toggleDevice = async (enabled: boolean) => {
    setIsBusy(true);
    setError(null);
    try {
      await (enabled ? enableDevice() : disableDevice());
    } catch (cause) {
      console.error(cause);
      setError(
        enabled
          ? "알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요."
          : "알림을 끄지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const togglePreference = async (kind: NotificationKind, checked: boolean) => {
    if (!preferences) return;
    const previous = preferences;
    setPreferences({ ...preferences, [kind]: checked }); // 화면에는 바로 반영하고, 실패하면 되돌린다.
    setError(null);
    try {
      const response = await fetch(ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [kind]: checked }),
      });
      if (!response.ok) throw new Error(`알림 설정을 저장하지 못했습니다. (${response.status})`);
      setPreferences(((await response.json()) as { preferences: NotificationPreferences }).preferences);
    } catch (cause) {
      console.error(cause);
      setPreferences(previous);
      setError("알림 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const state = ((): NotificationSettingsState => {
    if (support === null) return { kind: "loading" };
    if (support !== "supported") return { kind: support };
    if (!preferences || isDeviceEnabled === null) {
      return error ? { kind: "load-failed" } : { kind: "loading" };
    }
    return {
      kind: "ready",
      isDeviceEnabled,
      isPermissionDenied: permission === "denied",
      items: NOTIFICATION_KINDS.map((kind) => ({
        kind,
        ...NOTIFICATION_KIND_LABELS[kind],
        checked: preferences[kind],
      })),
    };
  })();

  return { state, isBusy, error, toggleDevice, togglePreference };
}
