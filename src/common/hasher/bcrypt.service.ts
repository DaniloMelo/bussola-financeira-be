import { Injectable } from "@nestjs/common";
import { HasherProtocol } from "./hasher.protocol";
import * as bcrypt from "bcryptjs";

@Injectable()
export class BcryptService extends HasherProtocol {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    return isPasswordValid;
  }
}
