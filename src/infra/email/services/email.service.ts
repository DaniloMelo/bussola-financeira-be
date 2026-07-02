import { Injectable } from "@nestjs/common";
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
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  async resetPassword(params: ResetPasswordParams) {
    const { userName, email, resetUrl } = params;

    await this.emailQueue.add(
      EmailJobs.RESET_PASSWORD,
      { userName, email, resetUrl },
      { priority: 1 },
    );
  }

  async resetPasswordNotification(
    params: Omit<ResetPasswordParams, "resetUrl">,
  ) {
    const { userName, email } = params;

    await this.emailQueue.add(
      EmailJobs.RESET_PASSWORD_NOTIFICATION,
      { userName, email },
      { priority: 1 },
    );
  }
}
