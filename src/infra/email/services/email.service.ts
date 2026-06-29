import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { resetPasswordHtmlTemplate } from "../templates/html/reset-password-html.template";
import { resetPasswordTextTemplate } from "../templates/text/reset-password-txt.template";
import { resetPasswordNotificationHtmlTemplate } from "../templates/html/reset-password-notification-html.template";
import { resetPasswordNotificationTextTemplate } from "../templates/text/reset-password-notification-txt.template";

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
    const subject = "Solicitação de recuperação de senha";

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: resetPasswordHtmlTemplate(userName, resetUrl, subject),
      text: resetPasswordTextTemplate(userName, resetUrl, subject),
    });
  }

  async resetPasswordNotification(
    params: Omit<ResetPasswordParams, "resetUrl">,
  ) {
    const { userName, email } = params;
    const subject = "Senha alterada";

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: resetPasswordNotificationHtmlTemplate(userName, subject),
      text: resetPasswordNotificationTextTemplate(userName, subject),
    });
  }
}
