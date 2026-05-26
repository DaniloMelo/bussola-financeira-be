import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { resetPasswordHtmlTemplate } from "./templates/html/reset-password-html.template";

interface ResetPasswordParams {
  userName: string;
  email: string;
  resetUrl: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async resetPassword(params: ResetPasswordParams) {
    const { userName, email, resetUrl } = params;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: "Recuperação de senha",
        html: resetPasswordHtmlTemplate(userName, resetUrl),
        text: `${userName}, ${resetUrl}`,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
