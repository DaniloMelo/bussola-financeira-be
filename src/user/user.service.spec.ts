/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { BadRequestException } from "@nestjs/common";
import { IStoredUser } from "./interfaces/user";
import { IUpdateUserData } from "./interfaces/update";

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
            findAll: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
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

      await expect(userService.create(newUser)).rejects.toThrow(
        "Falha ao criar o usuário. Verifique os dados fornecidos.",
      );

      await expect(userService.create(newUser)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        newUser.email,
      );

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("Should find all users", async () => {
      const storedUsers: IStoredUser[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@email.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          userCredentials: {
            id: "11",
            lastLoginAt: null,
          },
        },
        {
          id: "2",
          name: "Jane Doe",
          email: "jane@email.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          userCredentials: {
            id: "22",
            lastLoginAt: null,
          },
        },
      ];

      jest.spyOn(userRepositoryMock, "findAll").mockResolvedValue(storedUsers);

      const result = await userService.findAll();

      expect(userRepositoryMock.findAll).toHaveBeenCalled();

      expect(result).toEqual(storedUsers);
    });

    it("Should return an empty array if no user exists", async () => {
      jest.spyOn(userRepositoryMock, "findAll").mockResolvedValue([]);

      const result = await userService.findAll();

      expect(userRepositoryMock.findAll).toHaveBeenCalled();

      expect(result.length).toBe(0);

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("Should successfully update all properties", async () => {
      const storedUser: IStoredUser = {
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

      const hashedPassword = "hashedPasswod";

      const storedUpdatedUser: IStoredUser = {
        id: "1",
        name: "John Doe Updated",
        email: "john_updated@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
        },
      };

      const userDataToUpdate: IUpdateUserData = {
        name: "John Doe Updated",
        email: "john_updated@email.com",
        password: "updated_password123",
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(storedUser);

      jest.spyOn(userRepositoryMock, "findOneByEmail").mockResolvedValue(null);

      jest.spyOn(hasherServiceMock, "hash").mockResolvedValue(hashedPassword);

      jest
        .spyOn(userRepositoryMock, "update")
        .mockResolvedValue(storedUpdatedUser);

      const result = await userService.update(storedUser.id, userDataToUpdate);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
        storedUser.id,
      );

      expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        userDataToUpdate.email,
      );

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(
        userDataToUpdate.password,
      );

      expect(userRepositoryMock.update).toHaveBeenCalledWith(storedUser.id, {
        ...userDataToUpdate,
        password: hashedPassword,
      });

      expect(result).toEqual(storedUpdatedUser);
    });

    it("Should update 'name' only", async () => {
      const storedUser: IStoredUser = {
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

      const userDataToUpdate: IUpdateUserData = {
        name: "John Doe Updated",
        email: undefined,
        password: undefined,
      };

      const storedUpdatedUser: IStoredUser = {
        id: "1",
        name: "John Doe Updated",
        email: "john@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
        },
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(storedUser);

      jest
        .spyOn(userRepositoryMock, "update")
        .mockResolvedValue(storedUpdatedUser);

      const result = await userService.update(storedUser.id, userDataToUpdate);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
        storedUser.id,
      );

      expect(userRepositoryMock.findOneByEmail).not.toHaveBeenCalled();

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userRepositoryMock.update).toHaveBeenCalledWith(
        storedUser.id,
        userDataToUpdate,
      );

      expect(result).toEqual(storedUpdatedUser);
    });

    it("Should update 'email' only", async () => {
      const storedUser: IStoredUser = {
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

      const userDataToUpdate: IUpdateUserData = {
        name: undefined,
        email: "john_updated@email.com",
        password: undefined,
      };

      const storedUpdatedUser: IStoredUser = {
        id: "1",
        name: "John Doe",
        email: "john_updated@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
        },
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(storedUser);

      jest.spyOn(userRepositoryMock, "findOneByEmail").mockResolvedValue(null);

      jest
        .spyOn(userRepositoryMock, "update")
        .mockResolvedValue(storedUpdatedUser);

      const result = await userService.update(storedUser.id, userDataToUpdate);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
        storedUser.id,
      );

      expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        userDataToUpdate.email,
      );

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userRepositoryMock.update).toHaveBeenCalledWith(
        storedUser.id,
        userDataToUpdate,
      );

      expect(result).toEqual(storedUpdatedUser);
    });

    it("Should update 'password' only", async () => {
      const storedUser: IStoredUser = {
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

      const hashedPassword = "hashedpassword";

      const storedUpdatedUser: IStoredUser = {
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

      const userDataToUpdate: IUpdateUserData = {
        name: undefined,
        email: undefined,
        password: "updated_password123",
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(storedUser);

      jest.spyOn(hasherServiceMock, "hash").mockResolvedValue(hashedPassword);

      jest
        .spyOn(userRepositoryMock, "update")
        .mockResolvedValue(storedUpdatedUser);

      const result = await userService.update(storedUser.id, userDataToUpdate);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
        storedUser.id,
      );

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(
        userDataToUpdate.password,
      );

      expect(userRepositoryMock.update).toHaveBeenCalledWith(storedUser.id, {
        ...userDataToUpdate,
        password: hashedPassword,
      });

      expect(result).toEqual(storedUpdatedUser);
    });

    it("Should throw 'BadRequestException' when no data is provided", async () => {
      const storedUser: IStoredUser = {
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

      const userDataToUpdate: IUpdateUserData = {
        name: undefined,
        email: undefined,
        password: undefined,
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(storedUser);

      await expect(
        userService.update(storedUser.id, userDataToUpdate),
      ).rejects.toThrow("Nenhum dado foi fornecido.");

      await expect(
        userService.update(storedUser.id, userDataToUpdate),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(userRepositoryMock.findOneById).not.toHaveBeenCalled();

      expect(userRepositoryMock.findOneByEmail).not.toHaveBeenCalled();

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });

    it("Should throw 'BadRequestException' when email already in use", async () => {
      const storedUser: IStoredUser = {
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

      const anotherStoredUser: IStoredUser = {
        id: "2",
        name: "Jane Doe",
        email: "jane@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "22",
          lastLoginAt: null,
        },
      };

      const userDataToUpdate: IUpdateUserData = {
        name: undefined,
        email: "jane@email.com",
        password: undefined,
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(storedUser);

      jest
        .spyOn(userRepositoryMock, "findOneByEmail")
        .mockResolvedValue(anotherStoredUser);

      await expect(
        userService.update(storedUser.id, userDataToUpdate),
      ).rejects.toThrow(
        "Impossível atualizar o seu usuário. Verifique as suas credenciais e tente novamente.",
      );

      await expect(
        userService.update(storedUser.id, userDataToUpdate),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
        storedUser.id,
      );

      expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        userDataToUpdate.email,
      );

      expect(hasherServiceMock.hash).not.toHaveBeenCalled();

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
  });
});
