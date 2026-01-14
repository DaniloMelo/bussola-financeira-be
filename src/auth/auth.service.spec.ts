/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { JwtService } from "@nestjs/jwt";
import { ILogin } from "./interfaces/login";
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
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: HasherProtocol,
          useValue: mockHasherService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
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

  describe("login", () => {
    const storedUser = {
      id: "1",
      name: "John Doe",
      email: "john@email.com",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userCredentials: {
        id: "11",
        lastLoginAt: new Date(),
        userId: "1",
        passwordHash: "hashed-password",
        refreshTokenHash: null,
      },
    };

    const loginUserData: ILogin = {
      email: "john@email.com",
      password: "password123",
    };

    it("Should successfull login user and return tokens", async () => {
      const fakeAccessToken = "fake_access_token";
      const fakeRefreshToken = "fake_refresh_token";
      const fakeHashedRefreshToken = "fake_hashed-refresh-token";

      jest
        .spyOn(userServiceMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(storedUser);

      jest.spyOn(hasherServiceMock, "compare").mockResolvedValue(true);

      jest
        .spyOn(jwtServiceMock, "signAsync")
        .mockResolvedValueOnce(fakeAccessToken)
        .mockResolvedValueOnce(fakeRefreshToken);

      jest
        .spyOn(hasherServiceMock, "hash")
        .mockResolvedValue(fakeHashedRefreshToken);

      const result = await authService.login(loginUserData);

      expect(result).toEqual({
        access_token: fakeAccessToken,
        refresh_token: fakeRefreshToken,
      });

      expect(
        userServiceMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(loginUserData.email);

      expect(hasherServiceMock.compare).toHaveBeenCalledWith(
        loginUserData.password,
        storedUser.userCredentials.passwordHash,
      );

      expect(
        userServiceMock.saveRefreshTokenAndLastLoginAt,
      ).toHaveBeenCalledWith(storedUser.id, fakeHashedRefreshToken);
    });

    it("Should throw BadRequestException if user don't exist", async () => {
      jest
        .spyOn(userServiceMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(null);

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

    it("Should throw BadRequestException if password is incorrect", async () => {
      jest
        .spyOn(userServiceMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(storedUser);

      jest.spyOn(hasherServiceMock, "compare").mockResolvedValue(false);

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
        storedUser.userCredentials.passwordHash,
      );

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();
    });
  });

  describe("refreshTokens", () => {
    const storedUser = {
      id: "1",
      name: "John Doe",
      email: "john@email.com",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userCredentials: {
        id: "11",
        lastLoginAt: new Date(),
        userId: "1",
        passwordHash: "hashed-password",
        refreshTokenHash: "hashed-refresh-token",
      },
    };

    const fakeAcessToken = "fake_access_token";
    const fakeRefreshToken = "fake_refresh_token";
    const fakeHashedRefreshToken = "fake_hashed_refresh_token";

    it("Should successfuly refresh tokens", async () => {
      jest
        .spyOn(userServiceMock, "findOneByIdWithCredentials")
        .mockResolvedValue(storedUser);

      jest.spyOn(hasherServiceMock, "compare").mockResolvedValue(true);

      jest
        .spyOn(jwtServiceMock, "signAsync")
        .mockResolvedValueOnce(fakeAcessToken)
        .mockResolvedValueOnce(fakeRefreshToken);

      jest
        .spyOn(hasherServiceMock, "hash")
        .mockResolvedValue(fakeHashedRefreshToken);

      const result = await authService.refreshTokens(
        storedUser.id,
        fakeRefreshToken,
      );

      expect(result).toEqual({
        access_token: fakeAcessToken,
        refresh_token: fakeRefreshToken,
      });

      expect(userServiceMock.findOneByIdWithCredentials).toHaveBeenCalledWith(
        storedUser.id,
      );

      expect(hasherServiceMock.compare).toHaveBeenCalledWith(
        fakeRefreshToken,
        storedUser.userCredentials.refreshTokenHash,
      );

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(fakeRefreshToken);

      expect(userServiceMock.updateRefreshToken).toHaveBeenCalledWith(
        storedUser.id,
        fakeHashedRefreshToken,
      );
    });

    it("Should throw 'ForbiddenException' if the user is not found", async () => {
      jest
        .spyOn(userServiceMock, "findOneByIdWithCredentials")
        .mockResolvedValue(null);

      const refreshTokensPromise = authService.refreshTokens(
        storedUser.id,
        fakeRefreshToken,
      );

      await expect(refreshTokensPromise).rejects.toThrow(/^Acesso negado.$/);

      await expect(refreshTokensPromise).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(hasherServiceMock.compare).not.toHaveBeenCalled();

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });

    it("Should throw 'ForbiddenException' if refresh token dont match", async () => {
      jest
        .spyOn(userServiceMock, "findOneByIdWithCredentials")
        .mockResolvedValue(storedUser);

      jest.spyOn(hasherServiceMock, "compare").mockResolvedValue(false);

      const refreshTokensPromise = authService.refreshTokens(
        storedUser.id,
        fakeRefreshToken,
      );

      await expect(refreshTokensPromise).rejects.toThrow(/^Acesso negado.$/);

      await expect(refreshTokensPromise).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(hasherServiceMock.compare).toHaveBeenCalledWith(
        fakeRefreshToken,
        storedUser.userCredentials.refreshTokenHash,
      );

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userServiceMock.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    const storedUser = {
      id: "1",
      name: "John Doe",
      email: "john@email.com",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userCredentials: {
        id: "11",
        lastLoginAt: new Date(),
        userId: "1",
        passwordHash: "hashed-password",
        refreshTokenHash: null,
      },
      roles: [
        {
          name: "USER",
        },
      ],
    };

    it("Should successfully logout a user", async () => {
      jest
        .spyOn(userServiceMock, "updateRefreshToken")
        .mockResolvedValue(storedUser);

      const result = await authService.logout("1");

      expect(result).toEqual(storedUser);
    });
  });
});
