/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { JwtService } from "@nestjs/jwt";
import { ILogin } from "./interfaces/login";
import { IJwtPayload } from "./interfaces/jwt-payload";
import { BadRequestException } from "@nestjs/common";

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
          useValue: {
            findOneByEmailWithCredentials: jest.fn(),
          },
        },
        {
          provide: HasherProtocol,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userServiceMock = module.get<UserService>(UserService);
    hasherServiceMock = module.get<HasherProtocol>(HasherProtocol);
    jwtServiceMock = module.get<JwtService>(JwtService);
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
      },
    };

    const loginUserData: ILogin = {
      email: "john@email.com",
      password: "pass123",
    };

    it("Should successfull login user and return tokens", async () => {
      const jwtPayload: IJwtPayload = {
        sub: storedUser.id,
      };

      const accessToken = "accessToken";

      jest
        .spyOn(userServiceMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(storedUser);

      jest.spyOn(hasherServiceMock, "compare").mockResolvedValue(true);

      jest.spyOn(jwtServiceMock, "signAsync").mockResolvedValue(accessToken);

      const result = await authService.login(loginUserData);

      expect(
        userServiceMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(loginUserData.email);

      expect(hasherServiceMock.compare).toHaveBeenCalledWith(
        loginUserData.password,
        storedUser.userCredentials.passwordHash,
      );

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(jwtPayload);

      expect(result).toEqual({
        access_token: accessToken,
      });
    });

    it("Should throw BadRequestException if user don't exist", async () => {
      jest
        .spyOn(userServiceMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(null);

      await expect(authService.login(loginUserData)).rejects.toThrow(
        "Falha ao fazer login. Verifique suas credenciais.",
      );

      await expect(authService.login(loginUserData)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(
        userServiceMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(loginUserData.email);

      expect(hasherServiceMock.compare).not.toHaveBeenCalled();

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it("Should throw BadRequestException if password is incorrect", async () => {
      jest
        .spyOn(userServiceMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(storedUser);

      jest.spyOn(hasherServiceMock, "compare").mockResolvedValue(false);

      await expect(authService.login(loginUserData)).rejects.toThrow(
        "Falha ao fazer login. Verifique suas credenciais.",
      );

      await expect(authService.login(loginUserData)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(
        userServiceMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith(loginUserData.email);

      expect(hasherServiceMock.compare).toHaveBeenCalledWith(
        loginUserData.password,
        storedUser.userCredentials.passwordHash,
      );

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
