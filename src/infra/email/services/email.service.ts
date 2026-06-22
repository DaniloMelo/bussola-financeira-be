import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { resetPasswordHtmlTemplate } from "../templates/html/reset-password-html.template";
import { resetPasswordTextTemplate } from "../templates/text/reset-password-txt.template";

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

    await this.mailerService.sendMail({
      to: email,
      subject: "Recuperação de senha",
      html: resetPasswordHtmlTemplate(userName, resetUrl),
      text: resetPasswordTextTemplate(userName, resetUrl),
    });
  }
}
