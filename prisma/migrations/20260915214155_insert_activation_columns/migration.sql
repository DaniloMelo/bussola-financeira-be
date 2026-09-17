-- AlterTable
ALTER TABLE "user_credentials" ADD COLUMN     "activation_code" INTEGER,
ADD COLUMN     "activation_code_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "activation_code_expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;
