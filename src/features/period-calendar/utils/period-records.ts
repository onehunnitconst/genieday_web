import { addDays, differenceInCalendarDays, subDays } from "date-fns";
import type { IsoDate, PeriodRecord } from "@/types/period";
import { DEFAULT_PERIOD_LENGTH, MAX_PERIOD_LENGTH } from "../constants";
import { fromIsoDate, toIsoDate } from "./date";

// IsoDate는 사전순 비교가 곧 날짜순 비교다.

export const sortRecords = (records: PeriodRecord[]) =>
  [...records].sort((a, b) => a.startDate.localeCompare(b.startDate));

export const getPeriodLength = (record: PeriodRecord) =>
  differenceInCalendarDays(
    fromIsoDate(record.endDate),
    fromIsoDate(record.startDate),
  ) + 1;

export const findRecordContaining = (records: PeriodRecord[], date: IsoDate) =>
  records.find((r) => r.startDate <= date && date <= r.endDate);

/** date 이전에 시작한 기록 중 가장 최근 것. */
const findLatestRecordBefore = (records: PeriodRecord[], date: IsoDate) =>
  sortRecords(records)
    .filter((r) => r.startDate < date)
    .at(-1);

const findNextRecordAfter = (records: PeriodRecord[], date: IsoDate) =>
  sortRecords(records).find((r) => r.startDate > date);

/**
 * 기록 밖의 날짜를 직전 기록의 종료일로 삼을 수 있으면 그 기록을 돌려준다.
 * (종료일을 늦게 누른 경우 기간을 늘려주기 위함)
 */
export const findExtendableRecord = (records: PeriodRecord[], date: IsoDate) => {
  const previous = findLatestRecordBefore(records, date);
  if (!previous || previous.endDate >= date) return undefined;
  const length =
    differenceInCalendarDays(fromIsoDate(date), fromIsoDate(previous.startDate)) + 1;
  return length <= MAX_PERIOD_LENGTH ? previous : undefined;
};

/** date를 시작일로 새 기록을 추가한다. 다음 기록과 겹치지 않도록 종료일을 줄인다. */
export const addPeriodStart = (
  records: PeriodRecord[],
  date: IsoDate,
  id: string,
): PeriodRecord[] => {
  const defaultEnd = addDays(fromIsoDate(date), DEFAULT_PERIOD_LENGTH - 1);
  const next = findNextRecordAfter(records, date);
  const limit = next ? subDays(fromIsoDate(next.startDate), 1) : undefined;
  const endDate = toIsoDate(limit && limit < defaultEnd ? limit : defaultEnd);
  return sortRecords([...records, { id, startDate: date, endDate }]);
};

export const setPeriodEnd = (
  records: PeriodRecord[],
  recordId: string,
  date: IsoDate,
): PeriodRecord[] =>
  records.map((r) =>
    r.id === recordId && r.startDate <= date ? { ...r, endDate: date } : r,
  );

export const removeRecord = (records: PeriodRecord[], recordId: string) =>
  records.filter((r) => r.id !== recordId);
