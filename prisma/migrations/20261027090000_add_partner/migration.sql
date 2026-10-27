-- CreateTable
CREATE TABLE "p_partner_invites" (
    "user_id" TEXT NOT NULL,
    "code" CHAR(8) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "p_partner_invites_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "p_partners" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "nickname" VARCHAR(12) NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "p_partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "p_partner_invites_code_key" ON "p_partner_invites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "p_partners_user_id_key" ON "p_partners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "p_partners_token_hash_key" ON "p_partners"("token_hash");

-- AddForeignKey
ALTER TABLE "p_partner_invites" ADD CONSTRAINT "p_partner_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p_partners" ADD CONSTRAINT "p_partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 연결 코드 형식: 헷갈리는 0·O·1·I·L을 뺀 대문자·숫자 8자 (src/server/partner.ts와 같은 규칙)
ALTER TABLE "p_partner_invites" ADD CONSTRAINT "p_partner_invites_code_format"
  CHECK ("code" ~ '^[A-HJKMNP-Z2-9]{8}$');

-- 파트너 이름 형식: p_users.nickname과 같은 규칙 (src/utils/nickname.ts)
ALTER TABLE "p_partners" ADD CONSTRAINT "p_partners_nickname_format"
  CHECK ("nickname" ~ '^[가-힣a-zA-Z0-9]{2,12}$');
