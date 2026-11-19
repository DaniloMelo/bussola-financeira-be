import { InjectQueue } from "@nestjs/bull";
import { EMAIL_QUEUE } from "../constants/email.constant";
import { Queue } from "bull";
import { Injectable } from "@nestjs/common";
import { EmailJobs } from "../enums/email-queue.enum";

export interface UpdateCounterParams {
  date: string;
}

@Injectable()
export class UpstashEmailCounterService {
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  async updateCounter(params: UpdateCounterParams) {
    const { date } = params;

    const job = await this.emailQueue.add(
      EmailJobs.UPDATE_UPSTASH_COUNTER,
      { date },
      { priority: 1, attempts: 5 },
    );

    return { jobId: job.id };
  }
}
