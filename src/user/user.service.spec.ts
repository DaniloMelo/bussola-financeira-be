/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { BadRequestException } from "@nestjs/common";

describe("UserService", () => {
  let userService: UserService;
  let userRepositoryMock: UserRepository;
  let hasherServiceMock: HasherProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: HasherProtocol,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepositoryMock = module.get<UserRepository>(UserRepository);
    hasherServiceMock = module.get<HasherProtocol>(HasherProtocol);
  });

  describe("create", () => {
    it("Should create a new user", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@email.com",
        password: "password123",
      };

      const hashedPassword = "hashedpassword";

      const storedUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
        },
      };

      jest.spyOn(userRepositoryMock, "findOneByEmail").mockResolvedValue(null);
      jest.spyOn(hasherServiceMock, "hash").mockResolvedValue(hashedPassword);
      jest.spyOn(userRepositoryMock, "create").mockResolvedValue(storedUser);

      const result = await userService.create(newUser);

      expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        newUser.email,
      );

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(newUser.password);

      expect(userRepositoryMock.create).toHaveBeenCalledWith({
        ...newUser,
        password: hashedPassword,
      });

      expect(result).toEqual(storedUser);
    });

    it("Should throw 'BadRequesException' when user already exists", async () => {
      const storedUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
        },
      };

      const newUser = {
        name: "John Doe",
        email: "john@email.com",
        password: "password123",
      };

      jest
        .spyOn(userRepositoryMock, "findOneByEmail")
        .mockResolvedValue(storedUser);

      await userService.create(newUser).catch((error: BadRequestException) => {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(400);
        expect(error.message).toBe(
          "Falha ao criar o usuário. Verifique os dados fornecidos.",
        );
      });

      expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        newUser.email,
      );

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });
  });
});
