import { Module } from "@nestjs/common";
import { TesteController } from "./teste.controller";
import { TesteService } from "./teste.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TesteController],
  providers: [TesteService],
})
export class TesteModule {}
