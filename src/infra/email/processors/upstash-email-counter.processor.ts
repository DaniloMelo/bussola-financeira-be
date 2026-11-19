/* eslint-disable @typescript-eslint/no-unused-vars */
import { Process, Processor } from "@nestjs/bull";
import { EMAIL_QUEUE } from "../constants/email.constant";
import { EmailProviderProtocol } from "../providers/email.provider.protocol";
import { EmailJobs } from "../enums/email-queue.enum";
import { Job } from "bull";
import { UpdateCounterParams } from "../services/upstash-email-counter.service";
import { upstashEmailCounterHtmlTemplate } from "../templates/html/upstash-email-counter-html.template";
import { upstashEmailCounterTxtTemplate } from "../templates/text/upstash-email-counter-txt.template";

@Processor(EMAIL_QUEUE)
export class UpstashEmailCounterProcessor {
  constructor(private readonly emailProvider: EmailProviderProtocol) {}

  @Process(EmailJobs.UPDATE_UPSTASH_COUNTER)
  async handleUpstashUpdateCounter(job: Job<UpdateCounterParams>) {
    const subject = "Contador do serviço Upstash";

    await this.emailProvider.sendMail({
      to: "danilomarquesdemelo@gmail.com",
      subject: "Reinicialização do contador upstash",
      html: upstashEmailCounterHtmlTemplate(subject),
      text: upstashEmailCounterTxtTemplate(subject),
    });
  }
}
