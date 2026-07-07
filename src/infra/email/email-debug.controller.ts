import { InjectQueue } from "@nestjs/bull";
import { Controller, Get } from "@nestjs/common";
import { EMAIL_QUEUE } from "./constants/email.constant";
import { Job, Queue } from "bull";

@Controller("debug")
export class EmailDebugController {
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  @Get("queue")
  async queue() {
    const waiting = await this.emailQueue.getWaiting();
    const active = await this.emailQueue.getActive();
    const failed = await this.emailQueue.getFailed();
    const completed = await this.emailQueue.getCompleted();

    const simplify = (jobs: Job[]) =>
      jobs.map((job) => ({
        id: job.id,
        name: job.name,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      }));

    return {
      counts: await this.emailQueue.getJobCounts(),
      waiting: simplify(waiting),
      active: simplify(active),
      failed: simplify(failed),
      completed: simplify(completed),
    };
  }
}
