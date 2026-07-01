import { Injectable } from "@nestjs/common";
import { HasherProtocol } from "./hasher.protocol";
import * as bcrypt from "bcryptjs";

@Injectable()
export class BcryptService extends HasherProtocol {
  async hash(rawText: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(rawText, salt);
    return hash;
  }
  async compare(rawText: string, textHash: string): Promise<boolean> {
    const isPasswordValid = await bcrypt.compare(rawText, textHash);
    return isPasswordValid;
  }
}
