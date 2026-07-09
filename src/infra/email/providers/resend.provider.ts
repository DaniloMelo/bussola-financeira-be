import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import {
  EmailProviderProtocol,
  SendMailOptions,
} from "./email.provider.protocol";

@Injectable()
export class ResendProvider implements EmailProviderProtocol {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(ResendProvider.name);

  constructor(private readonly configService: ConfigService) {
    const RESEND_API_KEY = this.configService.get<string>("RESEND_API_KEY");
    this.resend = new Resend(RESEND_API_KEY);

    const fromName = this.configService.get<string>("EMAIL_FROM_NAME");
    const fromAddress = this.configService.get<string>("EMAIL_FROM_ADDRESS");
    this.from = `${fromName} <${fromAddress}>`;
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      this.logger.error(`[Resend] Re-throwing the error for queue retry`);
      throw new Error(`[Resend] Error sending email: ${error.message}`);
    }

    this.logger.log(`[Resend] Email sent to: ${options.to}. ID: ${data?.id}`);
  }
}
