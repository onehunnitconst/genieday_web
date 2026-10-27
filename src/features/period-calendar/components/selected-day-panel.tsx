import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectedDayStatus } from "../use-period-calendar";
import { DeletePeriodDialog } from "./delete-period-dialog";

type SelectedDayPanelProps = {
  dayLabel: string;
  status: SelectedDayStatus;
  predictionLabel: string | null;
  onStartPeriod: () => void;
  onEndPeriod: () => void;
  onDeletePeriod: () => void;
};

export function SelectedDayPanel({
  dayLabel,
  status,
  predictionLabel,
  onStartPeriod,
  onEndPeriod,
  onDeletePeriod,
}: SelectedDayPanelProps) {
  const canEnd =
    (status.kind === "none" && status.extendableFrom !== null) ||
    (status.kind === "in-period" && !status.isEndDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dayLabel}</CardTitle>
        {predictionLabel && (
          <p className="text-label-medium text-secondary-text">{predictionLabel} (예측)</p>
        )}
        {(status.kind !== "future" || !predictionLabel) && (
          <p className="text-body-small text-muted-foreground">{describeStatus(status)}</p>
        )}
      </CardHeader>
      {status.kind !== "future" && (
        <CardContent className="flex flex-wrap gap-2">
          {status.kind === "none" && (
            <Button
              size="lg"
              className="flex-1"
              onClick={onStartPeriod}
            >
              생리 시작
            </Button>
          )}
          {canEnd && (
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={onEndPeriod}
            >
              이 날로 종료
            </Button>
          )}
          {status.kind === "in-period" && (
            <DeletePeriodDialog onConfirm={onDeletePeriod} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

function describeStatus(status: SelectedDayStatus) {
  switch (status.kind) {
    case "future":
      return "아직 오지 않은 날이에요.";
    case "in-period":
      return `생리 ${status.dayNumber}일차 · 총 ${status.periodLength}일`;
    case "none":
      return status.extendableFrom
        ? `${status.extendableFrom}에 시작한 생리를 이 날까지로 늘릴 수 있어요.`
        : "기록이 없어요.";
  }
}
