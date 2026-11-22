import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infra/prisma/prisma.service";
import {
  FindLastDateRepositoryOutput,
  UpdateUpstashDateCountRepositoryInput,
} from "../interfaces/repository/update-upstash-date-count.interface";

@Injectable()
export class AdminApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async findLastDate(): Promise<FindLastDateRepositoryOutput | null> {
    const result = await this.prisma.applicationSetting.findUnique({
      where: {
        key: "last_upstash_email_sent",
      },
      select: {
        value: true,
      },
    });

    if (!result) {
      return null;
    }

    if (typeof result.value !== "string") {
      throw new Error("Invalid setting value");
    }

    return {
      value: result.value,
    };
  }
}
