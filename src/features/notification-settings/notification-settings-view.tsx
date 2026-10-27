import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { NotificationKind } from "@/types/notification";
import type { NotificationSettingsState } from "./use-notification-settings";

export type NotificationSettingsViewProps = {
  state: NotificationSettingsState;
  isBusy: boolean;
  error: string | null;
  onToggleDevice: (enabled: boolean) => void;
  onTogglePreference: (kind: NotificationKind, checked: boolean) => void;
};

export function NotificationSettingsView({
  state,
  isBusy,
  error,
  onToggleDevice,
  onTogglePreference,
}: NotificationSettingsViewProps) {
  if (state.kind === "loading") {
    return <div aria-busy className="h-56 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell aria-hidden className="size-4 text-primary-text" />
          알림
        </CardTitle>
        {state.kind !== "ready" && (
          <p className="text-body-small text-muted-foreground">{describeUnavailable(state.kind)}</p>
        )}
      </CardHeader>

      {state.kind === "ready" && (
        <CardContent className="flex flex-col gap-3">
          <SettingRow
            id="notification-device"
            title="이 기기에서 알림 받기"
            description={
              state.isPermissionDenied
                ? "브라우저 설정에서 알림이 막혀 있어요. 설정에서 지니데이 알림을 허용해 주세요."
                : "켜 두면 아래에서 고른 알림을 이 기기로 보내드려요."
            }
            checked={state.isDeviceEnabled}
            disabled={isBusy || state.isPermissionDenied}
            onCheckedChange={onToggleDevice}
          />
          <Separator />
          {state.items.map((item) => (
            <SettingRow
              key={item.kind}
              id={`notification-${item.kind}`}
              title={item.title}
              description={item.description}
              checked={item.checked}
              disabled={!state.isDeviceEnabled}
              onCheckedChange={(checked) => onTogglePreference(item.kind, checked)}
            />
          ))}
        </CardContent>
      )}

      {error && (
        <CardContent>
          <p role="alert" className="text-body-small text-destructive">
            {error}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

type SettingRowProps = {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function SettingRow({ id, title, description, checked, disabled, onCheckedChange }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col">
        <span id={`${id}-title`} className="text-body-medium">
          {title}
        </span>
        <span id={`${id}-description`} className="text-caption text-muted-foreground">
          {description}
        </span>
      </div>
      <Switch
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function describeUnavailable(kind: "needs-install" | "unsupported" | "load-failed") {
  switch (kind) {
    case "needs-install":
      return "iPhone·iPad에서는 Safari 공유 버튼으로 '홈 화면에 추가'한 뒤, 홈 화면의 지니데이에서 알림을 켤 수 있어요.";
    case "unsupported":
      return "이 브라우저에서는 알림을 받을 수 없어요.";
    case "load-failed":
      return "알림 설정을 불러오지 못했어요.";
  }
}
