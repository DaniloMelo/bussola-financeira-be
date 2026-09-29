import { Injectable } from "@nestjs/common";
import { ActivationCodeProtocol } from "./activation-code.protocol";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

@Injectable()
export class ActivationCodeService extends ActivationCodeProtocol {
  generate(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  hash(code: string): string {
    const secret = process.env.ACTIVATION_USER_SECRET || "local_secret";
    return createHmac("sha256", secret).update(code).digest("hex");
  }

  verify(code: string, storedHash: string): boolean {
    const generatedHash = this.hash(code);

    const generatedHashBuffer = Buffer.from(generatedHash, "utf-8");
    const storedHashBuffer = Buffer.from(storedHash, "utf-8");

    if (generatedHashBuffer.length !== storedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(generatedHashBuffer, storedHashBuffer);
  }

  generateExp(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    // expiresAt.setMinutes(expiresAt.getMinutes() + 1);

    return expiresAt;
  }

  verifyExp(exp: Date): boolean {
    const now = new Date();

    return now.getTime() > exp.getTime();
  }
}
