/* eslint-disable no-useless-catch */

import { Process, Processor } from "@nestjs/bull";
import { EMAIL_QUEUE } from "../constants/email.constant";
import { MailerService } from "@nestjs-modules/mailer";
import { EmailJobs } from "../enums/email-queue.enum";
import { Job } from "bull";
import { ResetPasswordParams } from "../services/email.service";
import { resetPasswordHtmlTemplate } from "../templates/html/reset-password-html.template";
import { resetPasswordTextTemplate } from "../templates/text/reset-password-txt.template";
import { resetPasswordNotificationHtmlTemplate } from "../templates/html/reset-password-notification-html.template";
import { resetPasswordNotificationTextTemplate } from "../templates/text/reset-password-notification-txt.template";

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process(EmailJobs.RESET_PASSWORD)
  async handleResetPassword(job: Job<ResetPasswordParams>) {
    const { userName, email, resetUrl } = job.data;
    const subject = "Solicitação de recuperação de senha";

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: resetPasswordHtmlTemplate(userName, resetUrl, subject),
        text: resetPasswordTextTemplate(userName, resetUrl, subject),
      });
    } catch (error) {
      throw error;
    }
  }

  @Process(EmailJobs.RESET_PASSWORD_NOTIFICATION)
  async handleResetPasswordNotification(
    job: Job<Omit<ResetPasswordParams, "resetUrl">>,
  ) {
    const { userName, email } = job.data;
    const subject = "Senha alterada";

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: resetPasswordNotificationHtmlTemplate(userName, subject),
        text: resetPasswordNotificationTextTemplate(userName, subject),
      });
    } catch (error) {
      throw error;
    }
  }
}
