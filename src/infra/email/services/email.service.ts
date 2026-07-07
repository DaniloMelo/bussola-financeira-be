/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";
import { EmailJobs } from "../enums/email-queue.enum";
import { InjectQueue } from "@nestjs/bull";
import { EMAIL_QUEUE } from "../constants/email.constant";

export interface ResetPasswordParams {
  userName: string;
  email: string;
  resetUrl: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  async resetPassword(params: ResetPasswordParams) {
    const { userName, email, resetUrl } = params;

    try {
      const job = await this.emailQueue.add(
        EmailJobs.RESET_PASSWORD,
        { userName, email, resetUrl },
        { priority: 1, attempts: 5 },
      );

      this.logger.log(await job.getState());
      this.logger.log(`Job criado: ${job.id}`);
      this.logger.log(`Job #${job.id} adicionado à fila para: ${email}`);
      this.logger.log(await this.emailQueue.getJobCounts());

      return { jobId: job.id };
    } catch (error: any) {
      this.logger.error(`Erro ao adicionar job à fila: ${error.message}`);
      throw error;
    }
  }

  async resetPasswordNotification(
    params: Omit<ResetPasswordParams, "resetUrl">,
  ) {
    const { userName, email } = params;

    try {
      const job = await this.emailQueue.add(
        EmailJobs.RESET_PASSWORD_NOTIFICATION,
        { userName, email },
        { priority: 1, attempts: 5 },
      );

      this.logger.log(await job.getState());
      this.logger.log(`Job criado: ${job.id}`);
      this.logger.log(`Job #${job.id} adicionado à fila para: ${email}`);
      this.logger.log(await this.emailQueue.getJobCounts());

      return { jobId: job.id };
    } catch (error: any) {
      this.logger.error(`Erro ao adicionar job à fila: ${error.message}`);
      throw error;
    }
  }
}
