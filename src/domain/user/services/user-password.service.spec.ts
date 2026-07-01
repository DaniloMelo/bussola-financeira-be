/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from "@nestjs/testing";
import { UserPasswordService } from "./user-password.service";
import { ConfigService } from "@nestjs/config";
import { UserRepository } from "../repositories/user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { EmailService } from "src/infra/email/services/email.service";
import { Random } from "src/common/utils/random";

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === "FRONTEND_URL_ORIGIN") return "http://localhost:3000";
    return null;
  }),
};

const mockUserRepository = {
  saveResetPasswordToken: jest.fn(),
  findResetPasswordToken: jest.fn(),
  invalidateResetPasswordToken: jest.fn(),
  findOneByEmailWithCredentials: jest.fn(),
  update: jest.fn(),
};

const mockHasherService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockEmailService = {
  resetPassword: jest.fn(),
  resetPasswordNotification: jest.fn(),
};

const mockRandom = {
  text: jest.fn(),
};

describe("UserPasswordService", () => {
  let userPasswordService: UserPasswordService;
  let userRepositoryMock: UserRepository;
  let hasherServiceMock: HasherProtocol;
  let emailServiceMock: EmailService;
  let randomMock: Random;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPasswordService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HasherProtocol, useValue: mockHasherService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: Random, useValue: mockRandom },
      ],
    }).compile();

    userPasswordService = module.get<UserPasswordService>(UserPasswordService);
    userRepositoryMock = module.get<UserRepository>(UserRepository);
    hasherServiceMock = module.get<HasherProtocol>(HasherProtocol);
    emailServiceMock = module.get<EmailService>(EmailService);
    randomMock = module.get<Random>(Random);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createMockStoredUser(override?: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      id: "1",
      name: "John Doe",
      email: "john@email.com",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userCredentials: {
        id: "11",
        lastLoginAt: null,
      },
      roles: [
        {
          name: "USER",
        },
      ],
      ...override,
    };
  }

  const rawResetPasswordToken = "raw-reset-password-token";
  const hashedResetPasswordToken = "hashed-reset-password-token";
  // const tokenExp = new Date(Date.now() + 15 * 60 * 1000);

  describe("requestPasswordReset", () => {
    function createMocksDefaultSetup() {
      const mockStoredUser = createMockStoredUser();
      mockUserRepository.findOneByEmailWithCredentials.mockResolvedValue(
        mockStoredUser,
      );
      mockRandom.text.mockReturnValue(rawResetPasswordToken);
      mockHasherService.hash.mockResolvedValue(hashedResetPasswordToken);
      mockUserRepository.saveResetPasswordToken.mockResolvedValue(true);
    }

    it("should successfully request a password reset", async () => {
      createMocksDefaultSetup();

      const result = await userPasswordService.requestPasswordReset({
        email: "john@email.com",
      });

      expect(result).toEqual({
        message:
          "Caso tenha um usuário cadastrado e válido, receberá um email com instruções de como redefinir a sua senha.",
      });
    });

    it("should generate, hash and save the reset password token", async () => {
      createMocksDefaultSetup();

      await userPasswordService.requestPasswordReset({
        email: "john@email.com",
      });

      expect(randomMock.text).toHaveBeenCalledTimes(1);

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(
        rawResetPasswordToken,
      );

      expect(userRepositoryMock.saveResetPasswordToken).toHaveBeenCalledWith(
        "1",
        hashedResetPasswordToken,
        expect.any(Date),
      );
    });

    it("should construct reset URL with correct structure", async () => {
      createMocksDefaultSetup();

      await userPasswordService.requestPasswordReset({
        email: "john@email.com",
      });

      const emailCallArgs = mockEmailService.resetPassword.mock.calls[0][0];
      const resetUrl = new URL(emailCallArgs.resetUrl as string);

      expect(resetUrl.pathname).toBe("/reset-password");
      expect(resetUrl.searchParams.get("token")).toBe(rawResetPasswordToken);
      expect(resetUrl.searchParams.get("email")).toBe("john@email.com");
    });

    it("should send email", async () => {
      createMocksDefaultSetup();

      await userPasswordService.requestPasswordReset({
        email: "john@email.com",
      });

      expect(emailServiceMock.resetPassword).toHaveBeenCalledWith({
        email: "john@email.com",
        userName: "John Doe",
        resetUrl:
          "http://localhost:3000/reset-password?token=raw-reset-password-token&email=john%40email.com",
      });
    });

    it("should return success message if user don't exist", async () => {
      mockUserRepository.findOneByEmailWithCredentials.mockResolvedValue(null);

      const result = await userPasswordService.requestPasswordReset({
        email: "unexistent_user@email.com",
      });

      expect(result).toEqual({
        message:
          "Caso tenha um usuário cadastrado e válido, receberá um email com instruções de como redefinir a sua senha.",
      });
    });
  });

  // describe("resetPawassword", () => {});
});
