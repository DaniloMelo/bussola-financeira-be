import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import {
  EmailProviderProtocol,
  SendMailOptions,
} from "./email.provider.protocol";

@Injectable()
export class MailtrapProvider implements EmailProviderProtocol {
  private readonly logger = new Logger(MailtrapProvider.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: SendMailOptions): Promise<void> {
    await this.mailerService.sendMail(options);
    this.logger.log(`[Mailtrap] Email sent to: ${options.to}`);
  }
}
