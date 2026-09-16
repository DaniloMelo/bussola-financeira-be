import { Module } from "@nestjs/common";
import { HasherProtocol } from "./hasher/hasher.protocol";
import { BcryptService } from "./hasher/bcrypt.service";
import { SanitizeService } from "./sanitize/sanitize.service";
import { SanitizeProtocol } from "./sanitize/sanitize.protocol";
import { Random } from "./utils/random";
import { ActivationCodeProtocol } from "./activation-code/activation-code.protocol";
import { ActivationCodeService } from "./activation-code/activation-code.service";

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
    {
      provide: ActivationCodeProtocol,
      useClass: ActivationCodeService,
    },
    Random,
  ],
  exports: [HasherProtocol, SanitizeProtocol, ActivationCodeProtocol, Random],
})
export class CommonModule {}
