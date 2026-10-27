import { NextResponse, type NextRequest } from "next/server";
import { getUserId } from "@/server/auth";
import { getPartnerStatus, unlinkPartner } from "@/server/partner";

const unauthorized = () =>
  NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

export async function GET(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  return NextResponse.json({ status: await getPartnerStatus(userId) });
}

/** 파트너 연결 해제 (만들어 둔 연결 코드도 함께 취소된다) */
export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) return unauthorized();

  await unlinkPartner(userId);
  return new NextResponse(null, { status: 204 });
}
