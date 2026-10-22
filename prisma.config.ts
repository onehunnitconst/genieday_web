import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.local" });

// ddu_be와 같은 DB를 쓰므로 마이그레이션은 period_check 스키마 안에서만 돈다
// (_prisma_migrations도 이 스키마에 따로 생겨 ddu_be의 마이그레이션 기록과 섞이지 않는다)
const directUrl = new URL(env("DIRECT_URL"));
directUrl.searchParams.set("schema", "period_check");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 마이그레이션은 트랜잭션 풀러(pgbouncer, 6543)를 거치면 안 되므로 직접 연결(5432)을 쓴다
    url: directUrl.toString(),
  },
});
