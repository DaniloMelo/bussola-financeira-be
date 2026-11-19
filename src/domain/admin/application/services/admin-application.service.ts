import { Injectable } from "@nestjs/common";
import { AdminApplicationRepository } from "../repositories/admin-application.repository";
import { UpdateUpstashDateCountInput } from "../interfaces/service/update-upstash-date-count.interface";

@Injectable()
export class AdminApplicationService {
  constructor(
    private readonly adminApplicationRepository: AdminApplicationRepository,
  ) {}

  async updateUpstashDateCount(date: UpdateUpstashDateCountInput) {
    await this.adminApplicationRepository.updateUpstashDateCount(date);
  }
}
