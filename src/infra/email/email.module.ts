import { Module } from "@nestjs/common";
import { EmailService } from "./services/email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { EMAIL_QUEUE } from "./constants/email.constant";
import { EmailProcessor } from "./processors/email.processor";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => {
        const isDevelopment = configService.get("NODE_ENV") === "development";

        return {
          transport: {
            host: configService.get("EMAIL_HOST"),
            port: Number(configService.get("EMAIL_PORT")),
            secure: !isDevelopment,
            auth: {
              user: configService.get("EMAIL_USERNAME"),
              pass: configService.get("EMAIL_PASSWORD"),
            },
          },
          defaults: {
            from: `"${configService.get("EMAIL_FROM_NAME")}" <${configService.get("EMAIL_FROM_ADDRESS")}>`,
          },
        };
      },
    }),

    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
