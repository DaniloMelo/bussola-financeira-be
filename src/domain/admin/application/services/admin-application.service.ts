import { Injectable } from "@nestjs/common";
import { AdminApplicationRepository } from "../repositories/admin-application.repository";
import { UpdateUpstashDateCountInput } from "../interfaces/service/update-upstash-date-count.interface";
import { UpstashEmailCounterService } from "src/infra/email/services/upstash-email-counter.service";

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
}
