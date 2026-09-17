import { Injectable } from "@nestjs/common";
import { ActivationCodeProtocol } from "./activation-code.protocol";
import { createHash, timingSafeEqual } from "crypto";

@Injectable()
export class ActivationCodeService extends ActivationCodeProtocol {
  generate(): string {
    return String(Math.floor(Math.random() * 1000000)).padStart(6, "1");
  }

  hash(code: string): string {
    return createHash("sha256").update(code.toString()).digest("hex");
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

    return expiresAt;
  }

  verifyExp(exp: Date): boolean {
    const now = new Date();

    return exp.getTime() > now.getTime();
  }
}

/*
  // src/shared/utils/hash-activation-code.util.ts
import { createHash } from 'crypto' // módulo nativo do Node.js, sem dependências

export function hashActivationCode(code: number): string {
  return createHash('sha256').update(code.toString()).digest('hex')
}

export function verifyActivationCode(code: number, hash: string): boolean {
  const codeHash = hashActivationCode(code)
  return codeHash === hash
}
*/
