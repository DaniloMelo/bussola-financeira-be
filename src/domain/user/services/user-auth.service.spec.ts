/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { UserAuthService } from "./user-auth.service";
import { UserRepository } from "../repositories/user.repository";

const mockUserRepository = {
  findOneByIdWithCredentials: jest.fn(),
  findOneByEmailWithCredentials: jest.fn(),
  saveRefreshTokenAndLastLoginAt: jest.fn(),
  updateRefreshToken: jest.fn(),
};

describe("UserAuthService", () => {
  let userAuthService: UserAuthService;
  let userRepositoryMock: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    userAuthService = module.get<UserAuthService>(UserAuthService);
    userRepositoryMock = module.get<UserRepository>(UserRepository);
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

  describe("saveRefreshTokenAndLastLoginAt", () => {
    it("should save lastLoginAt and refresh token after login", async () => {
      const userId = "1";
      const hashedRefreshToken = "hashed-refresh-token";
      const mockStoredUser = createMockStoredUser({
        userCredentials: {
          id: "11",
          lastLoginAt: new Date(),
          refreshTokenHash: hashedRefreshToken,
        },
      });

      mockUserRepository.saveRefreshTokenAndLastLoginAt.mockResolvedValue(
        mockStoredUser,
      );

      const result = await userAuthService.saveRefreshTokenAndLastLoginAt(
        userId,
        hashedRefreshToken,
      );

      expect(
        userRepositoryMock.saveRefreshTokenAndLastLoginAt,
      ).toHaveBeenCalledWith(userId, hashedRefreshToken);

      expect(result).not.toHaveProperty("password");
      expect(result.userCredentials!.lastLoginAt).not.toBeNull();

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: {
          id: "11",
          lastLoginAt: expect.any(Date),
          refreshTokenHash: hashedRefreshToken,
        },
        roles: [{ name: "USER" }],
      });
    });
  });

  describe("updateRefreshToken", () => {
    it("should update refresh token", async () => {
      const userId = "1";
      const updatedRefreshTokenHash = "updated-refresh-token-hash";
      const mockStoredUser = createMockStoredUser({
        userCredentials: {
          id: "11",
          lastLoginAt: new Date(),
          refreshTokenHash: updatedRefreshTokenHash,
        },
      });

      mockUserRepository.updateRefreshToken.mockResolvedValue(mockStoredUser);

      const result = await userAuthService.updateRefreshToken(
        userId,
        updatedRefreshTokenHash,
      );

      expect(userRepositoryMock.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        updatedRefreshTokenHash,
      );

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: {
          id: "11",
          lastLoginAt: expect.any(Date),
          refreshTokenHash: updatedRefreshTokenHash,
        },
        roles: [{ name: "USER" }],
      });
    });

    it("should invalidate the refresh token", async () => {
      const userId = "1";
      const refreshToken = null;
      const mockStoredUser = createMockStoredUser({
        userCredentials: {
          id: "11",
          lastLoginAt: new Date(),
          refreshTokenHash: refreshToken,
        },
      });

      mockUserRepository.updateRefreshToken.mockResolvedValue(mockStoredUser);

      const result = await userAuthService.updateRefreshToken(
        userId,
        refreshToken,
      );

      expect(userRepositoryMock.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        refreshToken,
      );

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: {
          id: "11",
          lastLoginAt: expect.any(Date),
          refreshTokenHash: refreshToken,
        },
        roles: [{ name: "USER" }],
      });
    });
  });

  describe("findOneByIdWithCredentials", () => {
    it("should find a user by ID including userCredentials relation", async () => {
      const storedUser = createMockStoredUser({
        userCredentials: {
          passwordHash: "hashed-password",
          refreshTokenHash: "hashed-token",
        },
      });

      mockUserRepository.findOneByIdWithCredentials.mockResolvedValue(
        storedUser,
      );

      const userId = "1";

      const result = await userAuthService.findOneByIdWithCredentials(userId);

      expect(
        userRepositoryMock.findOneByIdWithCredentials,
      ).toHaveBeenCalledWith(userId);

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: {
          passwordHash: "hashed-password",
          refreshTokenHash: "hashed-token",
        },
        roles: [{ name: "USER" }],
      });
    });

    it("should return null if user don't exist", async () => {
      mockUserRepository.findOneByIdWithCredentials.mockResolvedValue(null);

      const unexistentUserId = "unexistent-id";

      const result =
        await userAuthService.findOneByIdWithCredentials(unexistentUserId);

      expect(
        userRepositoryMock.findOneByIdWithCredentials,
      ).toHaveBeenCalledWith(unexistentUserId);

      expect(result).toBe(null);
    });
  });

  describe("findOneByEmailWithCredentials", () => {
    it("should find a user by email including userCredentials relation", async () => {
      const storedUser = createMockStoredUser({
        userCredentials: {
          passwordHash: "hashed-password",
          refreshTokenHash: "hashed-token",
        },
      });

      mockUserRepository.findOneByEmailWithCredentials.mockResolvedValue(
        storedUser,
      );

      const userEmail = "john@email.com";

      const result =
        await userAuthService.findOneByEmailWithCredentials(userEmail);

      expect(
        userRepositoryMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(userEmail);

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: {
          passwordHash: "hashed-password",
          refreshTokenHash: "hashed-token",
        },
        roles: [{ name: "USER" }],
      });
    });

    it("should return null if user don't exist", async () => {
      mockUserRepository.findOneByEmailWithCredentials.mockResolvedValue(null);

      const unexistentUserEmail = "unexistent@email.com";

      const result =
        await userAuthService.findOneByEmailWithCredentials(
          unexistentUserEmail,
        );

      expect(
        userRepositoryMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(unexistentUserEmail);

      expect(result).toBe(null);
    });
  });
});
