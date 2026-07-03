import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>("REDIS_URL");

        const defaultJobOptions = {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 5,
          backoff: {
            type: "exponential" as const,
            delay: 2000,
          },
        };

        if (redisUrl) {
          return {
            url: redisUrl,
            redis: {
              tls: {},
              maxRetriesPerRequest: null,
              connectTimeout: 10000,
            },
            defaultJobOptions,
          };
        }

        return {
          redis: {
            host: configService.get<string>("REDIS_HOST", "localhost"),
            port: configService.get<number>("REDIS_PORT", 6379),
          },
          defaultJobOptions,
        };
      },
    }),
  ],
})
export class QueueModule {}
