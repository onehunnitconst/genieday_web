import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PhaseGuide } from "../constants";

type PhaseGuideCardProps = {
  guide: PhaseGuide;
};

export function PhaseGuideCard({ guide }: PhaseGuideCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{guide.title}</CardTitle>
        <p className="text-body-small text-muted-foreground">{guide.body}</p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {guide.tips.map((tip) => (
            <li key={tip} className="flex gap-2 text-body-medium">
              <Check aria-hidden className="mt-1 size-4 shrink-0 text-period" />
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="text-caption text-muted-foreground">
        주기 예측을 바탕으로 한 일반적인 안내예요. 평소와 다르게 아프거나 불편하면 전문가와 상담해 주세요.
      </CardFooter>
    </Card>
  );
}
