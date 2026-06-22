/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
// import { UserService } from "src/domain/user/services/user.service";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { JwtService } from "@nestjs/jwt";
import { ILogin } from "./interfaces/login.interface";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserAuthService } from "src/domain/user/services/user-auth.service";

const mockUserAuthService = {
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
  let userAuthServiceMock: UserAuthService;
  let hasherServiceMock: HasherProtocol;
  let jwtServiceMock: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserAuthService, useValue: mockUserAuthService },
        { provide: HasherProtocol, useValue: mockHasherService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userAuthServiceMock = module.get<UserAuthService>(UserAuthService);
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
        id: "11",
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
      mockUserAuthService.findOneByEmailWithCredentials.mockResolvedValue(
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
        userAuthServiceMock.saveRefreshTokenAndLastLoginAt,
      ).toHaveBeenCalledWith(storedUserId, fakeHashedRefreshToken);
    });

    it("should throw BadRequestException if user don't exist", async () => {
      mockUserAuthService.findOneByEmailWithCredentials.mockResolvedValue(null);

      const loginPromise = authService.login(loginUserData);

      await expect(loginPromise).rejects.toThrow(
        /^Falha ao fazer login. Verifique suas credenciais.$/,
      );

      await expect(loginPromise).rejects.toBeInstanceOf(BadRequestException);

      expect(
        userAuthServiceMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(loginUserData.email);

      expect(hasherServiceMock.compare).not.toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
      expect(hasherServiceMock.hash).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if password is incorrect", async () => {
      const mockStoredUser = createMockStoredUser();

      mockUserAuthService.findOneByEmailWithCredentials.mockResolvedValue(
        mockStoredUser,
      );

      mockHasherService.compare.mockResolvedValue(false);

      const loginPromise = authService.login(loginUserData);

      await expect(loginPromise).rejects.toThrow(
        /^Falha ao fazer login. Verifique suas credenciais.$/,
      );

      await expect(loginPromise).rejects.toBeInstanceOf(BadRequestException);

      expect(
        userAuthServiceMock.findOneByEmailWithCredentials,
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

      mockUserAuthService.findOneByIdWithCredentials.mockResolvedValue(
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

      expect(userAuthServiceMock.updateRefreshToken).toHaveBeenCalledWith(
        storedUserId,
        fakeHashedRefreshToken,
      );
    });

    it("should throw 'ForbiddenException' if the user is not found", async () => {
      mockUserAuthService.findOneByIdWithCredentials.mockResolvedValue(null);

      const refreshTokensPromise = authService.refreshTokens(
        storedUserId,
        fakeRefreshToken,
      );

      await expect(refreshTokensPromise).rejects.toThrow(/^Acesso negado.$/);

      await expect(refreshTokensPromise).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(userAuthServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });

    it("should throw a 'ForbiddenException' when the refresh token is null or does not exist in the database", async () => {
      mockUserAuthService.findOneByIdWithCredentials.mockResolvedValue(
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

      expect(userAuthServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });

    it("should throw 'ForbiddenException' if refresh token dont match", async () => {
      const mockStoredUser = createMockStoredUser({
        userCredentials: {
          refreshTokenHash: fakeHashedRefreshToken,
        },
      });

      mockUserAuthService.findOneByIdWithCredentials.mockResolvedValue(
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

      expect(userAuthServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should update refresh token to a null value", async () => {
      mockUserAuthService.updateRefreshToken.mockResolvedValue(
        createMockStoredUser(),
      );

      const result = await authService.logout(storedUserId);

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: {
          id: "11",
          refreshTokenHash: null,
        },
        roles: [{ name: "USER" }],
      });
    });
  });
});
