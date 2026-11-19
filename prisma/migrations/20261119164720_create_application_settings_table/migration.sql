-- CreateEnum
CREATE TYPE "SettingCategory" AS ENUM ('APPLICATION');

-- CreateTable
CREATE TABLE "application-settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "value" JSONB NOT NULL,
    "category" "SettingCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application-settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application-settings_key_key" ON "application-settings"("key");
