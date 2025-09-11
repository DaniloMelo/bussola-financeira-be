import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { TesteModule } from "./teste/teste.module";

@Module({
  imports: [PrismaModule, TesteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
