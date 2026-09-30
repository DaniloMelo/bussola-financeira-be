/* eslint-disable @typescript-eslint/unbound-method */

import { ActivationCodeProtocol } from "src/common/activation-code/activation-code.protocol";
import { UserRepository } from "../repositories/user.repository";
import { UserActivationService } from "./user-activation.service";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";

const mockUserRepository = {
  findActivationCode: jest.fn(),
  updateActivationCodeAttempts: jest.fn(),
  activateUser: jest.fn(),
  updateActivationCode: jest.fn(),
};

const mockActivationCodeService = {
  generate: jest.fn(),
  hash: jest.fn(),
  verify: jest.fn(),
  generateExp: jest.fn(),
  verifyExp: jest.fn(),
};

describe("UserActivationService", () => {
  let userActivationService: UserActivationService;
  let userRepositoryMock: UserRepository;
  let activationCodeServiceMock: ActivationCodeProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserActivationService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ActivationCodeProtocol,
          useValue: mockActivationCodeService,
        },
      ],
    }).compile();

    userActivationService = module.get<UserActivationService>(
      UserActivationService,
    );
    userRepositoryMock = module.get<UserRepository>(UserRepository);
    activationCodeServiceMock = module.get<ActivationCodeProtocol>(
      ActivationCodeProtocol,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("activateUser", () => {
    it("should activate user", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: "hashed-activation-code",
          activationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
          activationCodeAttempts: 0,
        },
      });

      mockActivationCodeService.verifyExp.mockReturnValue(false);

      mockActivationCodeService.verify.mockReturnValue(true);

      mockUserRepository.activateUser.mockResolvedValue({
        name: "John Doe",
        email: "john@email.com",
        id: "1",
        isActive: true,
        deletedAt: null,
        createdAt: new Date("2026-09-16T10:00:00.000Z"),
        updatedAt: new Date("2026-09-16T10:00:00.000Z"),
      });

      const result = await userActivationService.activateUser({
        rawCode: "activation-code",
        email: "john@email.com",
      });

      expect(result).toEqual({
        name: "John Doe",
        email: "john@email.com",
        id: "1",
        isActive: true,
        deletedAt: null,
        createdAt: new Date("2026-09-16T10:00:00.000Z"),
        updatedAt: new Date("2026-09-16T10:00:00.000Z"),
      });

      expect(userRepositoryMock.activateUser).toHaveBeenCalledWith(
        "john@email.com",
      );
    });

    it("should throw BadRequestException when user dont exists", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue(null);

      const activateUserPromise = userActivationService.activateUser({
        rawCode: "activation-code",
        email: "john@email.com",
      });

      await expect(activateUserPromise).rejects.toThrow(
        /^Impossível ativar o usuário.$/,
      );

      await expect(activateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when the maximum number of attempts is reached", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: "hashed-activation-code",
          activationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
          activationCodeAttempts: 3,
        },
      });

      const activateUserPromise = userActivationService.activateUser({
        rawCode: "activation-code",
        email: "john@email.com",
      });

      await expect(activateUserPromise).rejects.toThrow(
        /^Atingiu o Número máximo de tentativas.$/,
      );

      await expect(activateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if the user try to activate a user where already activated", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: null,
          activationCodeExpiresAt: null,
          activationCodeAttempts: 0,
        },
      });

      const activateUserPromise = userActivationService.activateUser({
        rawCode: "activation-code",
        email: "john@email.com",
      });

      await expect(activateUserPromise).rejects.toThrow(
        /^Usuário já ativado.$/,
      );

      await expect(activateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when activation code is expired", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: "hashed-activation-code",
          activationCodeExpiresAt: new Date(Date.now() - 16 * 60 * 1000),
          activationCodeAttempts: 0,
        },
      });

      mockActivationCodeService.verifyExp.mockReturnValue(true);

      const activateUserPromise = userActivationService.activateUser({
        rawCode: "activation-code",
        email: "john@email.com",
      });

      await expect(activateUserPromise).rejects.toThrow(
        /^Código de ativação expirado.$/,
      );

      await expect(activateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it("shold throw BadRequestException when activation code is invalid", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: "hashed-activation-code",
          activationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
          activationCodeAttempts: 0,
        },
      });

      mockActivationCodeService.verifyExp.mockReturnValue(false);

      mockActivationCodeService.verify.mockReturnValue(false);

      const activateUserPromise = userActivationService.activateUser({
        rawCode: "activation-code",
        email: "john@email.com",
      });

      await expect(activateUserPromise).rejects.toThrow(
        /^Código de ativação inválido.$/,
      );

      await expect(activateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe("resendActivationCode", () => {
    it("should reset atempts and expiration when atempts is greater than 3 or expired", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: "hashed-activation-code",
          activationCodeExpiresAt: new Date("2026-09-16T10:00:00.000Z"),
          activationCodeAttempts: 3,
        },
      });

      mockActivationCodeService.generate.mockReturnValue("new-activation-code");

      mockActivationCodeService.hash.mockReturnValue(
        "new-activation-code-hashed",
      );

      mockActivationCodeService.generateExp.mockReturnValue(
        new Date("2026-09-16T10:15:00.000Z"),
      );

      await userActivationService.resendActivationCode({
        email: "john@email.com",
      });

      expect(userRepositoryMock.updateActivationCode).toHaveBeenCalledWith({
        email: "john@email.com",
        activationCode: "new-activation-code-hashed",
        activationCodeAttempts: 0,
        activationCodeExp: new Date("2026-09-16T10:15:00.000Z"),
      });
    });

    it("should keep the same atempts and expiration when atempts less then 3 or not expired", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: "hashed-activation-code",
          activationCodeExpiresAt: new Date("2026-09-16T10:00:00.000Z"),
          activationCodeAttempts: 2,
        },
      });

      mockActivationCodeService.generate.mockReturnValue("new-activation-code");

      mockActivationCodeService.hash.mockReturnValue(
        "new-activation-code-hashed",
      );

      await userActivationService.resendActivationCode({
        email: "john@email.com",
      });

      expect(userRepositoryMock.updateActivationCode).toHaveBeenCalledWith({
        email: "john@email.com",
        activationCode: "new-activation-code-hashed",
        activationCodeAttempts: 2,
        activationCodeExp: new Date("2026-09-16T10:00:00.000Z"),
      });

      expect(activationCodeServiceMock.generateExp).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when user dont exists", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue(null);

      const resendActivationPromise =
        userActivationService.resendActivationCode({
          email: "john@email.com",
        });

      await expect(resendActivationPromise).rejects.toThrow(
        /^Impossível enviar novo código de ativação.$/,
      );

      await expect(resendActivationPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if the user try to request new code when user already actvated", async () => {
      mockUserRepository.findActivationCode.mockResolvedValue({
        userCredentials: {
          activationCode: null,
          activationCodeExpiresAt: null,
          activationCodeAttempts: 0,
        },
      });

      const resendActivationPromise = userActivationService.activateUser({
        rawCode: "activation-code",
        email: "john@email.com",
      });

      await expect(resendActivationPromise).rejects.toThrow(
        /^Usuário já ativado.$/,
      );

      await expect(resendActivationPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
