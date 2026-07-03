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

        if (redisUrl) {
          return {
            redis: redisUrl,
            defaultJobOptions: {
              removeOnComplete: true,
              removeOnFail: true,
              attempts: 5,
              backoff: {
                type: "exponential",
                delay: 2000,
              },
            },
          };
        }

        return {
          redis: {
            host: configService.get("REDIS_HOST", "localhost"),
            port: configService.get("REDIS_PORT", 6379),
          },
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: true,
            attempts: 5,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
          },
        };
      },
    }),
  ],
})
export class QueueModule {}
