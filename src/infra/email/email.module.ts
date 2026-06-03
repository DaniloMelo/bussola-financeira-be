import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get("EMAIL_HOST"),
          port: configService.get("EMAIL_PORT"),
          secure: false,
          auth: {
            user: configService.get("EMAIL_USERNAME"),
            pass: configService.get("EMAIL_PASSWORD"),
          },
        },
        defaults: {
          from: `"${configService.get("EMAIL_FROM_NAME")}" <${configService.get("EMAIL_FROM_ADDRESS")}>`,
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
