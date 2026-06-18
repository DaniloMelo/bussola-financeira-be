/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "src/domain/user/user.service";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { JwtService } from "@nestjs/jwt";
import { ILogin } from "./interfaces/login.interface";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const mockUserService = {
  findOneByEmailWithCredentials: jest.fn(),
  findOneByIdWithCredentials: jest.fn(),
  saveRefreshTokenAndLastLoginAt: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockHasherService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === "JWT_SECRET") return "local_test_secret";
    if (key === "JWT_EXP") return "900";
    if (key === "JWT_REFRESH_SECRET") return "local_test_refresh_secret";
    if (key === "JWT_REFRESH_EXP") return "604800";
    return null;
  }),
};

describe("AuthService", () => {
  let authService: AuthService;
  let userServiceMock: UserService;
  let hasherServiceMock: HasherProtocol;
  let jwtServiceMock: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: HasherProtocol, useValue: mockHasherService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userServiceMock = module.get<UserService>(UserService);
    hasherServiceMock = module.get<HasherProtocol>(HasherProtocol);
    jwtServiceMock = module.get<JwtService>(JwtService);
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
        passwordHash: "hashed-password",
        refreshTokenHash: null,
      },
      roles: [
        {
          name: "USER",
        },
      ],
      ...override,
    };
  }

  const loginUserData: ILogin = {
    email: "john@email.com",
    password: "password123",
  };

  const storedUserId = "1";
  const fakeAccessToken = "fake-access-token";
  const fakeRefreshToken = "fake-refresh-token";
  const fakeHashedRefreshToken = "fake-hashed-refresh-token";

  describe("login", () => {
    function createMocksDefaultSetup() {
      mockUserService.findOneByEmailWithCredentials.mockResolvedValue(
        createMockStoredUser(),
      );
      mockHasherService.compare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce(fakeAccessToken)
        .mockResolvedValueOnce(fakeRefreshToken);
      mockHasherService.hash.mockResolvedValue(fakeHashedRefreshToken);
    }

    it("should successfull login user and return tokens", async () => {
      createMocksDefaultSetup();

      const result = await authService.login(loginUserData);

      expect(result).toEqual({
        access_token: fakeAccessToken,
        refresh_token: fakeRefreshToken,
      });
    });

    it("should hash and save refresh token before login", async () => {
      createMocksDefaultSetup();

      await authService.login(loginUserData);

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(fakeRefreshToken);

      expect(
        userServiceMock.saveRefreshTokenAndLastLoginAt,
      ).toHaveBeenCalledWith(storedUserId, fakeHashedRefreshToken);
    });

    it("should throw BadRequestException if user don't exist", async () => {
      mockUserService.findOneByEmailWithCredentials.mockResolvedValue(null);

      const loginPromise = authService.login(loginUserData);

      await expect(loginPromise).rejects.toThrow(
        /^Falha ao fazer login. Verifique suas credenciais.$/,
      );

      await expect(loginPromise).rejects.toBeInstanceOf(BadRequestException);

      expect(
        userServiceMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(loginUserData.email);

      expect(hasherServiceMock.compare).not.toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
      expect(hasherServiceMock.hash).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if password is incorrect", async () => {
      const mockStoredUser = createMockStoredUser();

      mockUserService.findOneByEmailWithCredentials.mockResolvedValue(
        mockStoredUser,
      );

      mockHasherService.compare.mockResolvedValue(false);

      const loginPromise = authService.login(loginUserData);

      await expect(loginPromise).rejects.toThrow(
        /^Falha ao fazer login. Verifique suas credenciais.$/,
      );

      await expect(loginPromise).rejects.toBeInstanceOf(BadRequestException);

      expect(
        userServiceMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(loginUserData.email);

      expect(hasherServiceMock.compare).toHaveBeenCalledWith(
        loginUserData.password,
        mockStoredUser.userCredentials.passwordHash,
      );

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
      expect(hasherServiceMock.hash).not.toHaveBeenCalled();
    });
  });

  describe("refreshTokens", () => {
    function createMocksDefaultSetup() {
      const mockStoredUser = createMockStoredUser({
        userCredentials: {
          refreshTokenHash: fakeHashedRefreshToken,
        },
      });

      mockUserService.findOneByIdWithCredentials.mockResolvedValue(
        mockStoredUser,
      );
      mockHasherService.compare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce(fakeAccessToken)
        .mockResolvedValueOnce(fakeRefreshToken);
      mockHasherService.hash.mockResolvedValue(fakeHashedRefreshToken);
    }

    it("should successfuly refresh tokens", async () => {
      createMocksDefaultSetup();

      const result = await authService.refreshTokens(
        storedUserId,
        fakeRefreshToken,
      );

      expect(result).toEqual({
        access_token: fakeAccessToken,
        refresh_token: fakeRefreshToken,
      });
    });

    it("should hash the new refresh token before saving", async () => {
      createMocksDefaultSetup();

      await authService.refreshTokens(storedUserId, fakeRefreshToken);

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(fakeRefreshToken);

      expect(userServiceMock.updateRefreshToken).toHaveBeenCalledWith(
        storedUserId,
        fakeHashedRefreshToken,
      );
    });

    it("should throw 'ForbiddenException' if the user is not found", async () => {
      mockUserService.findOneByIdWithCredentials.mockResolvedValue(null);

      const refreshTokensPromise = authService.refreshTokens(
        storedUserId,
        fakeRefreshToken,
      );

      await expect(refreshTokensPromise).rejects.toThrow(/^Acesso negado.$/);

      await expect(refreshTokensPromise).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(userServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });

    it("should throw a 'ForbiddenException' when the refresh token is null or does not exist in the database", async () => {
      mockUserService.findOneByIdWithCredentials.mockResolvedValue(
        createMockStoredUser(),
      );

      const refreshTokensPromise = authService.refreshTokens(
        storedUserId,
        fakeRefreshToken,
      );

      await expect(refreshTokensPromise).rejects.toThrow(/^Acesso negado.$/);

      await expect(refreshTokensPromise).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(userServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });

    it("should throw 'ForbiddenException' if refresh token dont match", async () => {
      const mockStoredUser = createMockStoredUser({
        userCredentials: {
          refreshTokenHash: fakeHashedRefreshToken,
        },
      });

      mockUserService.findOneByIdWithCredentials.mockResolvedValue(
        mockStoredUser,
      );

      jest.spyOn(hasherServiceMock, "compare").mockResolvedValue(false);

      const refreshTokensPromise = authService.refreshTokens(
        storedUserId,
        fakeRefreshToken,
      );

      await expect(refreshTokensPromise).rejects.toThrow(/^Acesso negado.$/);

      await expect(refreshTokensPromise).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(hasherServiceMock.compare).toHaveBeenCalledWith(
        fakeRefreshToken,
        fakeHashedRefreshToken,
      );

      expect(userServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  //==================================================================================================
  // describe("logout", () => {
  //   const storedUser = {
  //     id: "1",
  //     name: "John Doe",
  //     email: "john@email.com",
  //     deletedAt: null,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     userCredentials: {
  //       id: "11",
  //       lastLoginAt: new Date(),
  //       userId: "1",
  //       passwordHash: "hashed-password",
  //       refreshTokenHash: null,
  //     },
  //     roles: [
  //       {
  //         name: "USER",
  //       },
  //     ],
  //   };

  //   it("Should successfully logout a user", async () => {
  //     jest
  //       .spyOn(userServiceMock, "updateRefreshToken")
  //       .mockResolvedValue(storedUser);

  //     const result = await authService.logout("1");

  //     expect(result).toEqual(storedUser);
  //   });
  // });
});
