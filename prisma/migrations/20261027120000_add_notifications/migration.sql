-- CreateTable
CREATE TABLE "p_notification_preferences" (
    "user_id" TEXT NOT NULL,
    "period" BOOLEAN NOT NULL DEFAULT true,
    "fertile" BOOLEAN NOT NULL DEFAULT false,
    "pms" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "p_notification_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "p_push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "p_push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "p_push_subscriptions_endpoint_key" ON "p_push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "p_push_subscriptions_user_id_idx" ON "p_push_subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "p_notification_preferences" ADD CONSTRAINT "p_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p_push_subscriptions" ADD CONSTRAINT "p_push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "p_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

