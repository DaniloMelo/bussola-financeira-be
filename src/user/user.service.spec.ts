/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { BadRequestException } from "@nestjs/common";
import { IStoredUser } from "./interfaces/user";
import { IUpdateUserData } from "./interfaces/update";

const mockUserRepository = {
  create: jest.fn(),
  findOneByEmail: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findOneByIdWithCredentials: jest.fn(),
  findOneByEmailWithCredentials: jest.fn(),
  saveRefreshTokenAndLastLoginAt: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockHasherService = {
  hash: jest.fn(),
};

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
          useValue: mockUserRepository,
        },
        {
          provide: HasherProtocol,
          useValue: mockHasherService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepositoryMock = module.get<UserRepository>(UserRepository);
    hasherServiceMock = module.get<HasherProtocol>(HasherProtocol);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("Should create a new user", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@email.com",
        password: "password123",
      };

      const hashedPassword = "hashedpassword";

      const storedUser: IStoredUser = {
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
      const storedUser: IStoredUser = {
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
      };

      const newUser = {
        name: "John Doe",
        email: "john@email.com",
        password: "password123",
      };

      jest
        .spyOn(userRepositoryMock, "findOneByEmail")
        .mockResolvedValue(storedUser);

      const createUserPromise = userService.create(newUser);

      await expect(createUserPromise).rejects.toThrow(
        /^Falha ao criar o usuário. Verifique os dados fornecidos.$/,
      );

      await expect(createUserPromise).rejects.toBeInstanceOf(
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
        },
        {
          id: "2",
          name: "Jane Doe",
          email: "jane@email.com",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          userCredentials: {
            id: "22",
            lastLoginAt: null,
          },
          roles: [
            {
              name: "USER",
            },
          ],
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

  describe("findOneByIdWithCredentials", () => {
    it("Should find a user by ID including userCredentials relation", async () => {
      const storedUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
          passwordHash: "hashed-password",
          refreshTokenHash: "hashed-token",
          userId: "1",
        },
      };

      jest
        .spyOn(userRepositoryMock, "findOneByIdWithCredentials")
        .mockResolvedValue(storedUser);

      const result = await userService.findOneByIdWithCredentials("1");

      expect(
        userRepositoryMock.findOneByIdWithCredentials,
      ).toHaveBeenCalledWith("1");

      expect(result).toEqual(storedUser);
    });

    it("Should return null if user don't exist", async () => {
      jest
        .spyOn(userRepositoryMock, "findOneByIdWithCredentials")
        .mockResolvedValue(null);

      const result =
        await userService.findOneByIdWithCredentials("unexistent-id");

      expect(
        userRepositoryMock.findOneByIdWithCredentials,
      ).toHaveBeenCalledWith("unexistent-id");

      expect(result).toBe(null);
    });
  });

  describe("findOneByEmailWithCredentials", () => {
    it("Should find a user by email including userCredentials relation", async () => {
      const storedUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
          passwordHash: "hashed-password",
          refreshTokenHash: "hashed-token",
          userId: "1",
        },
      };

      jest
        .spyOn(userRepositoryMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(storedUser);

      const result =
        await userService.findOneByEmailWithCredentials("john@email.com");

      expect(
        userRepositoryMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith("john@email.com");

      expect(result).toEqual(storedUser);
    });

    it("Should return null if user don't exist", async () => {
      jest
        .spyOn(userRepositoryMock, "findOneByEmailWithCredentials")
        .mockResolvedValue(null);

      const result = await userService.findOneByEmailWithCredentials(
        "unexistent@email.com",
      );

      expect(
        userRepositoryMock.findOneByEmailWithCredentials,
      ).toHaveBeenCalledWith("unexistent@email.com");

      expect(result).toBe(null);
    });
  });

  describe("update", () => {
    it("Should successfully update all properties", async () => {
      const storedUser: IStoredUser = {
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
      };

      const hashedPassword = "hashedPasswod";

      const storedUpdatedUser: IStoredUser = {
        id: "1",
        name: "John Doe Updated",
        email: "john_updated@email.com",
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
      };

      const hashedPassword = "hashedpassword";

      const storedUpdatedUser: IStoredUser = {
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
      };

      const userDataToUpdate: IUpdateUserData = {
        name: undefined,
        email: undefined,
        password: undefined,
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(storedUser);

      const updateUserPromise = userService.update(
        storedUser.id,
        userDataToUpdate,
      );

      await expect(updateUserPromise).rejects.toThrow(
        /^Nenhum dado foi fornecido.$/,
      );

      await expect(updateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );

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
      };

      const anotherStoredUser: IStoredUser = {
        id: "2",
        name: "Jane Doe",
        email: "jane@email.com",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          id: "22",
          lastLoginAt: null,
        },
        roles: [
          {
            name: "USER",
          },
        ],
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

      const loginUserPromise = userService.update(
        storedUser.id,
        userDataToUpdate,
      );

      await expect(loginUserPromise).rejects.toThrow(
        /^Impossível atualizar o seu usuário. Verifique as suas credenciais e tente novamente.$/,
      );

      await expect(loginUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );

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

  describe("softDelete", () => {
    it("Should softly delete user", async () => {
      const userToDelete: IStoredUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        updatedAt: new Date(),
        createdAt: new Date(),
        userCredentials: {
          id: "11",
          lastLoginAt: null,
        },
        roles: [
          {
            name: "USER",
          },
        ],
      };

      jest
        .spyOn(userRepositoryMock, "findOneById")
        .mockResolvedValue(userToDelete);

      jest
        .spyOn(userRepositoryMock, "softDelete")
        .mockResolvedValue({ ...userToDelete, deletedAt: new Date() });

      const result = await userService.softDelete(userToDelete.id);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith("1");

      expect(userRepositoryMock.softDelete).toHaveBeenCalledWith("1");

      expect(result.deletedAt).not.toBeNull();
    });

    it("Should throw 'NotFoundException' if user dont exist", async () => {
      jest.spyOn(userRepositoryMock, "findOneById").mockResolvedValue(null);

      const deleteUserPromise = userService.softDelete("unexistent-id");

      await expect(deleteUserPromise).rejects.toThrow(
        /^Impossível excluir esse usuário.$/,
      );

      await expect(deleteUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe("saveRefreshTokenAndLastLoginAt", () => {
    it("Should save lastLoginAt and refreshTokenHash after login", async () => {
      const userId = "1";
      const hashedRefreshToken = "hashed_refresh_token";

      const storedUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        updatedAt: new Date(),
        createdAt: new Date(),
        userCredentials: {
          id: "11",
          userId: "1",
          passwordHash: "hashed_password",
          refreshTokenHash: "hashed_refresh_token",
          lastLoginAt: new Date(),
        },
      };

      jest
        .spyOn(userRepositoryMock, "saveRefreshTokenAndLastLoginAt")
        .mockResolvedValue(storedUser);

      const result = await userService.saveRefreshTokenAndLastLoginAt(
        userId,
        hashedRefreshToken,
      );

      expect(
        userRepositoryMock.saveRefreshTokenAndLastLoginAt,
      ).toHaveBeenCalledWith(userId, hashedRefreshToken);

      expect(result).toEqual(storedUser);
    });
  });

  describe("updateRefreshToken", () => {
    it("Should update refresh token", async () => {
      const userId = "1";
      const updatedRefreshTokenHash = "updated_refresh_token_hash";

      const storedUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        updatedAt: new Date(),
        createdAt: new Date(),
        userCredentials: {
          id: "11",
          userId: "1",
          passwordHash: "hashed_password",
          refreshTokenHash: "updated_refresh_token_hash",
          lastLoginAt: new Date(),
        },
        roles: [
          {
            name: "USER",
          },
        ],
      };

      jest
        .spyOn(userRepositoryMock, "updateRefreshToken")
        .mockResolvedValue(storedUser);

      const result = await userService.updateRefreshToken(
        userId,
        updatedRefreshTokenHash,
      );

      expect(userRepositoryMock.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        updatedRefreshTokenHash,
      );

      expect(result).toEqual(storedUser);
    });

    it("Should update refresh to a null value", async () => {
      const userId = "1";
      const updatedRefreshTokenHash = null;

      const storedUser = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        updatedAt: new Date(),
        createdAt: new Date(),
        userCredentials: {
          id: "11",
          userId: "1",
          passwordHash: "hashed_password",
          refreshTokenHash: null,
          lastLoginAt: new Date(),
        },
        roles: [
          {
            name: "USER",
          },
        ],
      };

      jest
        .spyOn(userRepositoryMock, "updateRefreshToken")
        .mockResolvedValue(storedUser);

      const result = await userService.updateRefreshToken(
        userId,
        updatedRefreshTokenHash,
      );

      expect(userRepositoryMock.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        updatedRefreshTokenHash,
      );

      expect(result).toEqual(storedUser);
    });
  });
});
