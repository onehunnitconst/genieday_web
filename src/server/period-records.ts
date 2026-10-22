import "server-only";

import { z } from "zod";
import type { IsoDate, PeriodRecord } from "@/types/period";
import { prisma } from "./db";

const isoDate = z.iso.date();

export const periodRecordsSchema = z
  .array(
    z
      .object({ id: z.uuid(), startDate: isoDate, endDate: isoDate })
      .refine((r) => r.startDate <= r.endDate, "종료일은 시작일보다 빠를 수 없습니다."),
  )
  .max(1000);

// DATE 컬럼은 UTC 자정의 Date로 오가므로 UTC 기준으로 변환해야 날짜가 밀리지 않는다
const toDate = (date: IsoDate) => new Date(`${date}T00:00:00Z`);
const toIsoDate = (date: Date): IsoDate => date.toISOString().slice(0, 10);

export async function listPeriodRecords(userId: string): Promise<PeriodRecord[]> {
  const rows = await prisma.periodRecord.findMany({
    where: { userId },
    orderBy: { startDate: "asc" },
    select: { id: true, startDate: true, endDate: true },
  });
  return rows.map((row) => ({
    id: row.id,
    startDate: toIsoDate(row.startDate),
    endDate: toIsoDate(row.endDate),
  }));
}

/** 사용자의 기록 전체를 records로 바꾼다. (클라이언트는 기록 목록 전체를 한 번에 저장한다) */
export async function replacePeriodRecords(userId: string, records: PeriodRecord[]) {
  await prisma.$transaction([
    prisma.periodRecord.deleteMany({ where: { userId } }),
    prisma.periodRecord.createMany({
      data: records.map((r) => ({
        id: r.id,
        userId,
        startDate: toDate(r.startDate),
        endDate: toDate(r.endDate),
      })),
    }),
  ]);
}
