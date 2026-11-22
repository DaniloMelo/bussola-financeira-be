import { Injectable, NotFoundException } from "@nestjs/common";
import { AdminApplicationRepository } from "../repositories/admin-application.repository";
import {
  FindLastDateOutput,
  UpdateUpstashDateCountInput,
} from "../interfaces/service/update-upstash-date-count.interface";
import { UpstashEmailCounterService } from "src/infra/email/services/upstash-email-counter.service";
import { getDayOfYear } from "src/common/utils/getDayOfTheYear";

@Injectable()
export class AdminApplicationService {
  constructor(
    private readonly adminApplicationRepository: AdminApplicationRepository,
    private readonly emailService: UpstashEmailCounterService,
  ) {}

  async updateUpstashDateCount(date: UpdateUpstashDateCountInput) {
    await this.adminApplicationRepository.updateUpstashDateCount(date);
    await this.emailService.updateCounter(date);

    return {
      message: "Email enviado, contador atualizado.",
    };
  }

  async findLastSentEmailDate(): Promise<FindLastDateOutput> {
    const result = await this.adminApplicationRepository.findLastDate();

    if (!result) {
      throw new NotFoundException("Data no último email não encontrada.");
    }

    const date = new Date(result.value);
    const emailSendingDayOfTheYear = getDayOfYear(date);
    const dayOfTheYearNow = getDayOfYear(new Date());
    const daysRemainig = 12 - (dayOfTheYearNow - emailSendingDayOfTheYear);

    console.log(daysRemainig);

    return {
      last_email_date: result.value,
      days_remaining: daysRemainig,
    };
  }
}
