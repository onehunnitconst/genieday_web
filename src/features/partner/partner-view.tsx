import { Check, Copy, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UnlinkPartnerDialog } from "./components/unlink-partner-dialog";
import type { PartnerCardState } from "./use-partner";

export type PartnerViewProps = {
  card: PartnerCardState;
  isBusy: boolean;
  error: string | null;
  isCopied: boolean;
  onIssueCode: () => void;
  onCopyCode: () => void;
  onCancelInvite: () => void;
  onUnlink: () => void;
};

export function PartnerView({
  card,
  isBusy,
  error,
  isCopied,
  onIssueCode,
  onCopyCode,
  onCancelInvite,
  onUnlink,
}: PartnerViewProps) {
  if (card.kind === "loading") {
    return <div aria-busy className="h-32 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshake aria-hidden className="size-4 text-period" />
          파트너
        </CardTitle>
        <p className="text-body-small text-muted-foreground">{describe(card)}</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {card.kind === "none" && (
          <Button size="lg" className="w-full" disabled={isBusy} onClick={onIssueCode}>
            {isBusy ? "코드를 만드는 중…" : "연결 코드 만들기"}
          </Button>
        )}

        {card.kind === "invited" && (
          <>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted py-4">
              <span
                className={
                  card.isExpired
                    ? "font-mono text-numeric-large tracking-[0.25em] text-muted-foreground line-through"
                    : "font-mono text-numeric-large tracking-[0.25em]"
                }
                aria-label={`연결 코드 ${card.code.split("").join(" ")}`}
              >
                {card.code}
              </span>
              <span className="text-caption text-muted-foreground tabular-nums">
                {card.isExpired ? "만료된 코드예요" : `${card.remainingLabel} 후 만료`}
              </span>
            </div>
            <div className="flex gap-2">
              {card.isExpired ? (
                <Button size="lg" className="flex-1" disabled={isBusy} onClick={onIssueCode}>
                  새 코드 만들기
                </Button>
              ) : (
                <Button size="lg" className="flex-1" disabled={isBusy} onClick={onCopyCode}>
                  {isCopied ? <Check /> : <Copy />}
                  {isCopied ? "복사했어요" : "코드 복사"}
                </Button>
              )}
              <Button size="lg" variant="outline" disabled={isBusy} onClick={onCancelInvite}>
                취소
              </Button>
            </div>
          </>
        )}

        {card.kind === "linked" && (
          <UnlinkPartnerDialog nickname={card.nickname} disabled={isBusy} onConfirm={onUnlink} />
        )}

        {error && (
          <p role="alert" className="text-body-small text-destructive">
            {error}
          </p>
        )}
      </CardContent>

      {card.kind !== "linked" && (
        <CardFooter className="text-caption text-muted-foreground">
          파트너는 내 생리 기록과 예측을 볼 수만 있고, 바꿀 수는 없어요.
        </CardFooter>
      )}
    </Card>
  );
}

function describe(card: Exclude<PartnerCardState, { kind: "loading" }>) {
  switch (card.kind) {
    case "none":
      return "코드를 만들어 파트너에게 알려 주세요. 파트너 앱에서 입력하면 내 주기를 함께 볼 수 있어요.";
    case "invited":
      return "파트너 앱에서 이 코드를 입력하면 연결돼요.";
    case "linked":
      return `${card.nickname}님과 ${card.linkedAtLabel}부터 연결되어 있어요.`;
  }
}
