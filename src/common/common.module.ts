import { Module } from "@nestjs/common";
import { HasherProtocol } from "./hasher/hasher.protocol";
import { BcryptService } from "./hasher/bcrypt.service";

@Module({
  providers: [
    {
      provide: HasherProtocol,
      useClass: BcryptService,
    },
  ],
  exports: [HasherProtocol],
})
export class CommonModule {}
