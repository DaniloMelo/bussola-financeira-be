import { Module } from "@nestjs/common";
import { TesteService } from "./teste.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { TesteRepository } from "./teste.repository";
import { TesteController } from "./v1/teste.controller";
import { TesteController as TesteControllerV2 } from "./v2/teste.controller";

@Module({
  imports: [PrismaModule],
  controllers: [TesteController, TesteControllerV2],
  providers: [TesteService, TesteRepository],
})
export class TesteModule {}
