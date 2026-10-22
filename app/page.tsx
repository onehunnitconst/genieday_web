import { AuthGateContainer } from "@/features/auth/auth-gate-container";
import { PeriodCalendarSkeleton } from "@/features/period-calendar/components/period-calendar-skeleton";
import { PeriodCalendarContainer } from "@/features/period-calendar/period-calendar-container";

export default function Home() {
  return (
    <AuthGateContainer fallback={<PeriodCalendarSkeleton />}>
      <PeriodCalendarContainer />
    </AuthGateContainer>
  );
}
