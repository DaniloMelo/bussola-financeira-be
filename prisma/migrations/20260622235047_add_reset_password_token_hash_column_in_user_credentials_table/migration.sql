-- AlterTable
ALTER TABLE "user_credentials" ADD COLUMN     "reset-password-expires-at" TIMESTAMP(3),
ADD COLUMN     "reset_password_token_hash" TEXT;
