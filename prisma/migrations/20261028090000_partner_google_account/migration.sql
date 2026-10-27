-- 파트너도 Google로 가입한다. 세션 쿠키 해시(token_hash) 대신 파트너의 사용자 ID로 연결한다.
-- 쿠키로만 연결돼 있던 기존 파트너는 어떤 사용자인지 알 수 없으므로 연결을 지운다 (파트너 앱에서 로그인 후 코드를 다시 입력해야 한다).
DELETE FROM "p_partners";

-- DropIndex
DROP INDEX "p_partners_token_hash_key";

-- AlterTable
ALTER TABLE "p_partners" DROP COLUMN "token_hash",
ADD COLUMN     "partner_user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "p_partners_partner_user_id_key" ON "p_partners"("partner_user_id");

-- AddForeignKey
ALTER TABLE "p_partners" ADD CONSTRAINT "p_partners_partner_user_id_fkey" FOREIGN KEY ("partner_user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 자기 자신의 파트너가 될 수는 없다 (파트너 앱 src/server/partner-link.ts에서도 먼저 막는다)
ALTER TABLE "p_partners" ADD CONSTRAINT "p_partners_not_self"
  CHECK ("user_id" <> "partner_user_id");
