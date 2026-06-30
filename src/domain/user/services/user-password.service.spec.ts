import { Test, TestingModule } from "@nestjs/testing";
import { UserPasswordService } from "./user-password.service";
import { ConfigService } from "@nestjs/config";
import { UserRepository } from "../repositories/user.repository";

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === "JWT_SECRET") return "local_test_secret";
    if (key === "JWT_EXP") return "900";
    if (key === "JWT_REFRESH_SECRET") return "local_test_refresh_secret";
    if (key === "JWT_REFRESH_EXP") return "604800";
    return null;
  }),
};

const mockUserRepository = {
  saveResetPasswordToken: jest.fn(),
  findResetPasswordToken: jest.fn(),
  invalidateResetPasswordToken: jest.fn(),
  update: jest.fn(),
};

describe("UserPasswordService", () => {
  let userPasswordService;
  let userRepositoryMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPasswordService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    userPasswordService = module.get<UserPasswordService>(UserPasswordService);
    userRepositoryMock = module.get<UserRepository>(UserRepository);
  });

  describe("requestPasswordReset", () => {
    it("", () => expect(1).toBe(1));
  });
  describe("resetPassword", () => {});
});
