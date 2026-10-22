import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IsoDate } from "@/types/period";
import { CalendarLegend } from "./components/calendar-legend";
import { CycleSummaryCard } from "./components/cycle-summary-card";
import { MonthCalendar } from "./components/month-calendar";
import { PeriodHistory } from "./components/period-history";
import { SelectedDayPanel } from "./components/selected-day-panel";
import type { CalendarDay } from "./utils/build-month-grid";
import type {
  CycleSummary,
  PeriodHistoryItem,
  SelectedDayStatus,
} from "./use-period-calendar";

export type PeriodCalendarViewProps = {
  /** 화면 맨 위 계정 영역 (닉네임·로그아웃) */
  accountBar: ReactNode;
  summary: CycleSummary | null;
  monthLabel: string;
  weeks: CalendarDay[][];
  selectedDayLabel: string;
  selectedStatus: SelectedDayStatus;
  selectedPrediction: string | null;
  history: PeriodHistoryItem[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectDate: (date: IsoDate) => void;
  onStartPeriod: () => void;
  onEndPeriod: () => void;
  onDeletePeriod: () => void;
};

export function PeriodCalendarView({
  accountBar,
  summary,
  monthLabel,
  weeks,
  selectedDayLabel,
  selectedStatus,
  selectedPrediction,
  history,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate,
  onStartPeriod,
  onEndPeriod,
  onDeletePeriod,
}: PeriodCalendarViewProps) {
  return (
    <main className="flex flex-col gap-4 p-4 @tablet:gap-6 @tablet:p-6">
      {accountBar}

      <CycleSummaryCard summary={summary} />

      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold @tablet:text-2xl">{monthLabel}</h1>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onToday}>
            오늘
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="이전 달"
            onClick={onPrevMonth}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="다음 달"
            onClick={onNextMonth}
          >
            <ChevronRight />
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <MonthCalendar weeks={weeks} onSelectDate={onSelectDate} />
        <CalendarLegend />
      </div>

      <SelectedDayPanel
        dayLabel={selectedDayLabel}
        status={selectedStatus}
        predictionLabel={selectedPrediction}
        onStartPeriod={onStartPeriod}
        onEndPeriod={onEndPeriod}
        onDeletePeriod={onDeletePeriod}
      />

      <PeriodHistory items={history} onSelect={onSelectDate} />
    </main>
  );
}
