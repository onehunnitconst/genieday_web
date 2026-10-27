"use client";

import { NotificationSettingsView } from "./notification-settings-view";
import { useNotificationSettings } from "./use-notification-settings";

/** 이 기기의 푸시 구독과 알림 종류별 설정. AuthGateContainer 안에서만 쓸 수 있다. */
export function NotificationSettingsContainer() {
  const vm = useNotificationSettings();

  return (
    <NotificationSettingsView
      state={vm.state}
      isBusy={vm.isBusy}
      error={vm.error}
      onToggleDevice={vm.toggleDevice}
      onTogglePreference={vm.togglePreference}
    />
  );
}
