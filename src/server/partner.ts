import "server-only";

import { randomInt } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import type { PartnerStatus } from "@/types/partner";
import { prisma } from "./db";

/** 헷갈리는 0·O·1·I·L을 뺀 대문자·숫자. 마이그레이션 SQL의 CHECK 제약(p_partner_invites_code_format)과 같다 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
/** 연결 코드 유효 시간 */
const INVITE_TTL_MS = 30 * 60 * 1000;
/** 이미 쓰고 있는 코드와 겹치면 새로 뽑는다. 31^8가지라 사실상 한 번에 끝난다 */
const MAX_CODE_ATTEMPTS = 5;

const generateCode = () =>
  Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join(
    "",
  );

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export async function getPartnerStatus(userId: string): Promise<PartnerStatus> {
  const [partner, invite] = await Promise.all([
    prisma.partner.findUnique({
      where: { userId },
      select: { nickname: true, createdAt: true },
    }),
    prisma.partnerInvite.findUnique({
      where: { userId },
      select: { code: true, expiresAt: true },
    }),
  ]);

  if (partner) {
    return {
      kind: "linked",
      nickname: partner.nickname,
      linkedAt: partner.createdAt.toISOString(),
    };
  }
  if (invite && invite.expiresAt > new Date()) {
    return { kind: "invited", code: invite.code, expiresAt: invite.expiresAt.toISOString() };
  }
  return { kind: "none" };
}

/**
 * 새 연결 코드를 만든다. 이전 코드는 이 코드로 바뀌어 더는 쓸 수 없다.
 * 이미 파트너가 연결돼 있으면 null.
 */
export async function createPartnerInvite(userId: string): Promise<PartnerStatus | null> {
  const linked = await prisma.partner.findUnique({ where: { userId }, select: { id: true } });
  if (linked) return null;

  for (let attempt = 1; ; attempt++) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    try {
      await prisma.partnerInvite.upsert({
        where: { userId },
        create: { userId, code, expiresAt },
        update: { code, expiresAt, createdAt: new Date() },
      });
      return { kind: "invited", code, expiresAt: expiresAt.toISOString() };
    } catch (error) {
      if (!isUniqueViolation(error) || attempt >= MAX_CODE_ATTEMPTS) throw error;
    }
  }
}

/** 파트너 연결을 끊고 만들어 둔 코드도 지운다. (파트너 앱은 다음 요청부터 연결 해제 화면을 보여준다) */
export async function unlinkPartner(userId: string) {
  await prisma.$transaction([
    prisma.partner.deleteMany({ where: { userId } }),
    prisma.partnerInvite.deleteMany({ where: { userId } }),
  ]);
}
