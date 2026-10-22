export function PeriodCalendarSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-4 p-4 @tablet:p-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-80 animate-pulse rounded-xl bg-muted @tablet:h-112" />
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
