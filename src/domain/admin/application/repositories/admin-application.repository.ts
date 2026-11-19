import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infra/prisma/prisma.service";
import { UpdateUpstashDateCountRepositoryInput } from "../interfaces/repository/update-upstash-date-count.interface";

@Injectable()
export class AdminApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async teste() {
    return await this.prisma.applicationSetting.findUnique({
      where: {
        key: "last_upstash_email_sent",
      },
    });
  }

  async updateUpstashDateCount(data: UpdateUpstashDateCountRepositoryInput) {
    return await this.prisma.applicationSetting.upsert({
      where: {
        key: "last_upstash_email_sent",
      },
      update: {
        value: data.date,
      },
      create: {
        key: "last_upstash_email_sent",
        value: "",
        category: "APPLICATION",
      },
    });
  }
}
