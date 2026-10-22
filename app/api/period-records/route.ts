import { NextResponse, type NextRequest } from "next/server";
import { getUserId } from "@/server/auth";
import {
  listPeriodRecords,
  periodRecordsSchema,
  replacePeriodRecords,
} from "@/server/period-records";

const unauthorized = () =>
  NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

export async function GET(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  return NextResponse.json({ records: await listPeriodRecords(userId) });
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  const body: unknown = await request.json().catch(() => null);
  const parsed = periodRecordsSchema.safeParse(
    (body as { records?: unknown } | null)?.records,
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "기록 형식이 올바르지 않습니다." }, { status: 400 });
  }

  await replacePeriodRecords(userId, parsed.data);
  return new NextResponse(null, { status: 204 });
}
