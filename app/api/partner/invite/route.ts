import { NextResponse, type NextRequest } from "next/server";
import { getUserId } from "@/server/auth";
import { createPartnerInvite } from "@/server/partner";

/** 파트너 연결 코드 발급 (이전 코드는 무효가 된다) */
export async function POST(request: NextRequest) {
  const userId = await getUserId(request.headers);
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const status = await createPartnerInvite(userId);
  if (!status) {
    return NextResponse.json(
      { error: "이미 파트너와 연결되어 있어요. 연결을 해제한 뒤 다시 시도해 주세요." },
      { status: 409 },
    );
  }
  return NextResponse.json({ status });
}
