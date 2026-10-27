import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PhaseGuide } from "./constants";
import { CycleSky } from "./components/cycle-sky";
import { PhaseGuideCard } from "./components/phase-guide-card";
import type { SkyState } from "./use-home";

export type HomeViewProps =
  | { kind: "empty" }
  | { kind: "ready"; sky: SkyState; guide: PhaseGuide };

export function HomeView(props: HomeViewProps) {
  if (props.kind === "empty") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>아직 기록이 없어요</CardTitle>
          <p className="text-body-small text-muted-foreground">
            생리 시작일을 기록하면 지금이 주기의 낮인지 밤인지, 몸에 어떤 변화가 있는지 알려드려요.
          </p>
        </CardHeader>
        <CardContent>
          <Link href="/calendar" className={buttonVariants({ size: "lg", className: "h-11 w-full" })}>
            <CalendarPlus />
            캘린더에서 기록하기
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 @tablet:gap-6">
      <CycleSky sky={props.sky} />
      <PhaseGuideCard guide={props.guide} />
    </div>
  );
}
