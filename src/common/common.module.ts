import { Module } from "@nestjs/common";
import { HasherProtocol } from "./hasher/hasher.protocol";
import { BcryptService } from "./hasher/bcrypt.service";
import { SanitizeService } from "./sanitize/sanitize.service";
import { SanitizeProtocol } from "./sanitize/sanitize.protocol";
import { Random } from "./utils/random";

@Module({
  providers: [
    {
      provide: HasherProtocol,
      useClass: BcryptService,
    },
    {
      provide: SanitizeProtocol,
      useClass: SanitizeService,
    },
    Random,
  ],
  exports: [HasherProtocol, SanitizeProtocol, Random],
})
export class CommonModule {}
