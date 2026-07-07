/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
        const isDevelopment = configService.get("NODE_ENV") === "development";
        // const redisUrl = configService.get<string>("REDIS_URL");

        const defaultJobOptions = {
          removeOnComplete: {
            age: 3600,
            count: 100,
          },
          removeOnFail: {
            age: 86400,
          },
          attempts: 5,
          backoff: {
            type: "exponential" as const,
            delay: 2000,
          },
        };

        // if (redisUrl) {
        //   return {
        //     url: redisUrl,
        //     redis: {
        //       tls: {
        //         rejectUnauthorized: false,
        //       },
        //       maxRetriesPerRequest: null,
        //       enableReadyCheck: false,
        //       connectTimeout: 30000,
        //     },
        //     defaultJobOptions,
        //   };
        // }

        if (isDevelopment) {
          return {
            redis: {
              host: configService.get<string>("REDIS_HOST", "localhost"),
              port: configService.get<number>("REDIS_PORT", 6379),
            },
            defaultJobOptions,
          };
        }

        console.log({
          host: configService.get("REDIS_HOST"),
          port: configService.get("REDIS_PORT"),
          username: configService.get("REDIS_USERNAME"),
        });

        return {
          redis: {
            host: configService.get<string>("REDIS_HOST"),
            port: configService.get<number>("REDIS_PORT"),
            username: configService.get<string>("REDIS_USERNAME"),
            password: configService.get<string>("REDIS_PASSWORD"),
            tls: {},
          },
          defaultJobOptions,
        };

        // return {
        //   redis: {
        //     host: configService.get<string>("REDIS_HOST", "localhost"),
        //     port: configService.get<number>("REDIS_PORT", 6379),
        //   },
        //   defaultJobOptions,
        // };
      },
    }),
  ],
})
export class QueueModule {}
