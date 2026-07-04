import { Module } from "@nestjs/common";
import { EmailService } from "./services/email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { EMAIL_QUEUE } from "./constants/email.constant";
import { EmailProcessor } from "./processors/email.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>("EMAIL_HOST"),
            port: configService.get<number>("EMAIL_PORT"),
            secure: false,
            requireTLS: true,
            auth: {
              user: configService.get<string>("EMAIL_USERNAME"),
              pass: configService.get<string>("EMAIL_PASSWORD"),
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"${configService.get<string>("EMAIL_FROM_NAME")}" <${configService.get<string>("EMAIL_FROM_ADDRESS")}>`,
          },
        };
      },
    }),
  ],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
