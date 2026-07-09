/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from "@nestjs/bull";
import { EMAIL_QUEUE } from "../constants/email.constant";
import { EmailJobs } from "../enums/email-queue.enum";
import { Job } from "bull";
import { ResetPasswordParams } from "../services/email.service";
import { resetPasswordHtmlTemplate } from "../templates/html/reset-password-html.template";
import { resetPasswordTextTemplate } from "../templates/text/reset-password-txt.template";
import { resetPasswordNotificationHtmlTemplate } from "../templates/html/reset-password-notification-html.template";
import { resetPasswordNotificationTextTemplate } from "../templates/text/reset-password-notification-txt.template";
import { Logger } from "@nestjs/common";
import { EmailProviderProtocol } from "../providers/email.provider.protocol";

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailProvider: EmailProviderProtocol) {}

  onModuleInit() {
    this.logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    this.logger.log(`EmailProcessor INICIALIZADO`);
    this.logger.log(`Aguardando jobs na fila: ${EMAIL_QUEUE}`);
    this.logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`[Job ${job.id}] Iniciando processamento: ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`[Job ${job.id}] Concluído com sucesso`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`[Job ${job.id}] Falhou: ${error.message}`);
    this.logger.error(error.stack);
  }

  @Process(EmailJobs.RESET_PASSWORD)
  async handleResetPassword(job: Job<ResetPasswordParams>) {
    const { userName, email, resetUrl } = job.data;
    const subject = "Solicitação de recuperação de senha";

    try {
      this.logger.log(`Processando envio de e-mail para o job ${job.id}`);

      await this.emailProvider.sendMail({
        to: email,
        subject,
        html: resetPasswordHtmlTemplate(userName, resetUrl, subject),
        text: resetPasswordTextTemplate(userName, resetUrl, subject),
      });

      this.logger.log(`E-mail enviado com sucesso para o job ${job.id}`);
    } catch (error: any) {
      this.logger.error(`Falha ao processar o job ${job.id}:`, error);
      this.logger.error(`Detalhes: ${error.message}`);

      if (error.code) {
        this.logger.error(`Código de erro: ${error.code}`);
      }
      if (error.response) {
        this.logger.error(`Resposta do servidor: ${error.response}`);
      }
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

      await this.emailProvider.sendMail({
        to: email,
        subject,
        html: resetPasswordNotificationHtmlTemplate(userName, subject),
        text: resetPasswordNotificationTextTemplate(userName, subject),
      });

      this.logger.log(`E-mail enviado com sucesso para o job ${job.id}`);
    } catch (error: any) {
      this.logger.error(`Falha ao processar o job ${job.id}:`, error);
      this.logger.error(`Detalhes: ${error.message}`);

      throw error;
    }
  }
}
