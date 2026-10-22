-- CreateTable
CREATE TABLE "p_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "p_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "p_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "p_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "p_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(3),
    "refresh_token_expires_at" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "p_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "p_verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "p_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "p_period_records" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "p_period_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "p_users_email_key" ON "p_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "p_sessions_token_key" ON "p_sessions"("token");

-- CreateIndex
CREATE INDEX "p_sessions_user_id_idx" ON "p_sessions"("user_id");

-- CreateIndex
CREATE INDEX "p_accounts_user_id_idx" ON "p_accounts"("user_id");

-- CreateIndex
CREATE INDEX "p_verifications_identifier_idx" ON "p_verifications"("identifier");

-- CreateIndex
CREATE INDEX "p_period_records_user_id_start_date_idx" ON "p_period_records"("user_id", "start_date");

-- AddForeignKey
ALTER TABLE "p_sessions" ADD CONSTRAINT "p_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p_accounts" ADD CONSTRAINT "p_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p_period_records" ADD CONSTRAINT "p_period_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
