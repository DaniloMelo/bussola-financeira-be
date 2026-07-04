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
import { Logger } from "@nestjs/common";

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailerService: MailerService) {}

  @Process(EmailJobs.RESET_PASSWORD)
  async handleResetPassword(job: Job<ResetPasswordParams>) {
    const { userName, email, resetUrl } = job.data;
    const subject = "Solicitação de recuperação de senha";

    try {
      this.logger.log(`Processando envio de e-mail para o job ${job.id}`);

      await this.mailerService.sendMail({
        to: email,
        subject,
        html: resetPasswordHtmlTemplate(userName, resetUrl, subject),
        text: resetPasswordTextTemplate(userName, resetUrl, subject),
      });

      this.logger.log(`E-mail enviado com sucesso para o job ${job.id}`);
    } catch (error) {
      this.logger.error(`Falha ao processar o job ${job.id}:`, error);
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
      this.logger.log(`Processando envio de e-mail para o job ${job.id}`);

      await this.mailerService.sendMail({
        to: email,
        subject,
        html: resetPasswordNotificationHtmlTemplate(userName, subject),
        text: resetPasswordNotificationTextTemplate(userName, subject),
      });

      this.logger.log(`E-mail enviado com sucesso para o job ${job.id}`);
    } catch (error) {
      this.logger.error(`Falha ao processar o job ${job.id}:`, error);
      throw error;
    }
  }
}
