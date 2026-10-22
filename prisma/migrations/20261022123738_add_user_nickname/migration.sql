-- AlterTable
ALTER TABLE "p_users" ADD COLUMN     "nickname" VARCHAR(12);

-- 닉네임 형식: 한글·영문·숫자 2–12자 (src/utils/nickname.ts와 같은 규칙)
ALTER TABLE "p_users" ADD CONSTRAINT "p_users_nickname_format"
  CHECK ("nickname" ~ '^[가-힣a-zA-Z0-9]{2,12}$');
