/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { BadRequestException } from "@nestjs/common";
import { ICreateUser, IStoredUser } from "./interfaces/user";
import { IUpdateUserData } from "./interfaces/update";
import { EmailService } from "src/infra/email/email.service";
import { SanitizeService } from "src/common/sanitize/sanitize.service";
import { SanitizeProtocol } from "src/common/sanitize/sanitize.protocol";

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

const mockSanitizeService = {
  sanitizeAll: jest.fn(),
};

const mockEmailService = {
  resetPassword: jest.fn(),
};

describe("UserService", () => {
  let userService: UserService;
  let userRepositoryMock: UserRepository;
  let hasherServiceMock: HasherProtocol;
  let sanitizeServiceMock: SanitizeService;
  let emailServiceMock: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HasherProtocol, useValue: mockHasherService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: SanitizeProtocol, useValue: mockSanitizeService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepositoryMock = module.get<UserRepository>(UserRepository);
    hasherServiceMock = module.get<HasherProtocol>(HasherProtocol);
    emailServiceMock = module.get<EmailService>(EmailService);
    sanitizeServiceMock = module.get<SanitizeProtocol>(SanitizeProtocol);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createUserInput(override?: Partial<ICreateUser>) {
    return {
      name: "John Doe",
      email: "john@email.com",
      password: "plain-text-password123",
      ...override,
    };
  }

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

  describe("create", () => {
    function createMocksDefaultSetup() {
      mockUserRepository.findOneByEmail.mockResolvedValue(null);
      mockSanitizeService.sanitizeAll.mockReturnValue("John Doe");
      mockHasherService.hash.mockResolvedValue("hashed-password123");
      mockUserRepository.create.mockResolvedValue(createMockStoredUser());
    }

    it("should create and return user without password", async () => {
      createMocksDefaultSetup();

      const input = createUserInput();
      const result = await userService.create(input);

      expect(result).toMatchObject({
        id: expect.any(String),
        name: "John Doe",
        email: "john@email.com",
        userCredentials: { id: "11", lastLoginAt: null },
        roles: [{ name: "USER" }],
      });

      expect(result).not.toHaveProperty("password");
    });

    it("should hash password before saving", async () => {
      createMocksDefaultSetup();

      const input = createUserInput();
      await userService.create(input);

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(
        "plain-text-password123",
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: "john@email.com",
        name: "John Doe",
        password: "hashed-password123",
      });
    });

    it("should sanitize name before saving", async () => {
      createMocksDefaultSetup();

      const input = createUserInput({
        name: "<script>alert(XSS)</script>John Doe",
      });
      await userService.create(input);

      expect(mockSanitizeService.sanitizeAll).toHaveBeenCalledWith(input.name);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: "john@email.com",
        name: "John Doe",
        password: "hashed-password123",
      });
    });

    it("should throw 'BadRequesException' when user already exists", async () => {
      createMocksDefaultSetup();
      mockUserRepository.findOneByEmail.mockResolvedValue(
        createMockStoredUser(),
      );

      const input = createUserInput();
      const createUserPromise = userService.create(input);

      await expect(createUserPromise).rejects.toThrow(
        /^Falha ao criar o usuário. Verifique os dados fornecidos.$/,
      );

      await expect(createUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        "john@email.com",
      );

      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });

    it("should throw 'BadRequesException' if sanitize fail", async () => {
      createMocksDefaultSetup();
      mockSanitizeService.sanitizeAll.mockReturnValue("");

      const input = createUserInput({ name: "<script>alert(XSS)</script>" });
      const createUserPromise = userService.create(input);

      await expect(createUserPromise).rejects.toThrow(
        /^Nome precisa conter caracteres válidos.$/,
      );

      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  // describe("findAll", () => {
  //   it("should find all users", async () => {
  //     const storedUsers = [mockStoredUser];

  //     jest.spyOn(userRepositoryMock, "findAll").mockResolvedValue(storedUsers);

  //     const result = await userService.findAll();

  //     expect(userRepositoryMock.findAll).toHaveBeenCalledTimes(1);

  //     expect(result).toMatchObject([
  //       {
  //         id: "1",
  //         name: "John Doe",
  //         email: "john@email.com",
  //         userCredentials: { id: "11", lastLoginAt: null },
  //         roles: [{ name: "USER" }],
  //       },
  //     ]);
  //   });

  //   it("should return an empty array if no user exists", async () => {
  //     jest.spyOn(userRepositoryMock, "findAll").mockResolvedValue([]);

  //     const result = await userService.findAll();

  //     expect(userRepositoryMock.findAll).toHaveBeenCalledTimes(1);

  //     expect(result.length).toBe(0);
  //   });
  // });

  // describe("findMe", () => {
  //   it("should find my user when authenticated", async () => {
  //     const userId = "1";

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(mockStoredUser);

  //     const result = await userService.findMe(userId);

  //     expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(userId);

  //     expect(result).toMatchObject({
  //       id: expect.any(String),
  //       name: "John Doe",
  //       email: "john@email.com",
  //       userCredentials: { id: "11", lastLoginAt: null },
  //       roles: [{ name: "USER" }],
  //     });
  //   });

  //   it("should return null if user dont exist", async () => {
  //     const unexistentUserId = "1";

  //     jest.spyOn(userRepositoryMock, "findOneById").mockResolvedValue(null);

  //     const result = await userService.findMe(unexistentUserId);

  //     expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
  //       unexistentUserId,
  //     );

  //     expect(result).toBe(null);
  //   });
  // });

  // describe("findOneByIdWithCredentials", () => {
  //   it("should find a user by ID including userCredentials relation", async () => {
  //     const storedUser = {
  //       ...mockStoredUser,
  //       userCredentials: {
  //         passwordHash: "hashed-password",
  //         refreshTokenHash: "hashed-token",
  //       },
  //     };

  //     const userId = "1";

  //     jest
  //       .spyOn(userRepositoryMock, "findOneByIdWithCredentials")
  //       .mockResolvedValue(storedUser);

  //     const result = await userService.findOneByIdWithCredentials(userId);

  //     expect(
  //       userRepositoryMock.findOneByIdWithCredentials,
  //     ).toHaveBeenCalledWith(userId);

  //     expect(result).toMatchObject({
  //       id: expect.any(String),
  //       name: "John Doe",
  //       email: "john@email.com",
  //       userCredentials: {
  //         passwordHash: "hashed-password",
  //         refreshTokenHash: "hashed-token",
  //       },
  //       roles: [{ name: "USER" }],
  //     });
  //   });

  //   it("should return null if user don't exist", async () => {
  //     const unexistentUserId = "unexistent-id";

  //     jest
  //       .spyOn(userRepositoryMock, "findOneByIdWithCredentials")
  //       .mockResolvedValue(null);

  //     const result =
  //       await userService.findOneByIdWithCredentials(unexistentUserId);

  //     expect(
  //       userRepositoryMock.findOneByIdWithCredentials,
  //     ).toHaveBeenCalledWith(unexistentUserId);

  //     expect(result).toBe(null);
  //   });
  // });

  // describe("findOneByEmailWithCredentials", () => {
  //   it("should find a user by email including userCredentials relation", async () => {
  //     const storedUser = {
  //       ...mockStoredUser,
  //       userCredentials: {
  //         passwordHash: "hashed-password",
  //         refreshTokenHash: "hashed-token",
  //       },
  //     };

  //     const userEmail = "john@email.com";

  //     jest
  //       .spyOn(userRepositoryMock, "findOneByEmailWithCredentials")
  //       .mockResolvedValue(storedUser);

  //     const result = await userService.findOneByEmailWithCredentials(userEmail);

  //     expect(
  //       userRepositoryMock.findOneByEmailWithCredentials,
  //     ).toHaveBeenCalledWith(userEmail);

  //     expect(result).toEqual(storedUser);
  //   });

  //   it("should return null if user don't exist", async () => {
  //     jest
  //       .spyOn(userRepositoryMock, "findOneByEmailWithCredentials")
  //       .mockResolvedValue(null);

  //     const unexistentUserEmail = "unexistent@email.com";

  //     const result =
  //       await userService.findOneByEmailWithCredentials(unexistentUserEmail);

  //     expect(
  //       userRepositoryMock.findOneByEmailWithCredentials,
  //     ).toHaveBeenCalledWith(unexistentUserEmail);

  //     expect(result).toBe(null);
  //   });
  // });

  // describe("update", () => {
  //   it("should successfully update all properties", async () => {
  //     const storedUpdatedUser = {
  //       ...mockStoredUser,
  //       name: "John Doe Updated",
  //       email: "john_updated@email.com",
  //     };

  //     const hashedPassword = "hashedPasswod";

  //     const userDataToUpdate: IUpdateUserData = {
  //       name: "John Doe Updated",
  //       email: "john_updated@email.com",
  //       password: "updated_password123",
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(mockStoredUser);

  //     jest
  //       .spyOn(sanitizeServiceMock, "sanitizeAll")
  //       .mockReturnValue("John Doe Updated");

  //     jest.spyOn(userRepositoryMock, "findOneByEmail").mockResolvedValue(null);

  //     jest.spyOn(hasherServiceMock, "hash").mockResolvedValue(hashedPassword);

  //     jest
  //       .spyOn(userRepositoryMock, "update")
  //       .mockResolvedValue(storedUpdatedUser);

  //     const result = await userService.update(
  //       mockStoredUser.id,
  //       userDataToUpdate,
  //     );

  //     expect(hasherServiceMock.hash).toHaveBeenCalledWith(
  //       userDataToUpdate.password,
  //     );

  //     expect(userRepositoryMock.update).toHaveBeenCalledWith(
  //       mockStoredUser.id,
  //       {
  //         ...userDataToUpdate,
  //         password: hashedPassword,
  //       },
  //     );

  //     expect(result).toEqual(storedUpdatedUser);
  //   });

  //   it("Should update 'name' only", async () => {
  //     const storedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     const userDataToUpdate: IUpdateUserData = {
  //       name: "John Doe Updated",
  //       email: undefined,
  //       password: undefined,
  //     };

  //     const storedUpdatedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe Updated",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(storedUser);

  //     jest
  //       .spyOn(userRepositoryMock, "update")
  //       .mockResolvedValue(storedUpdatedUser);

  //     const result = await userService.update(storedUser.id, userDataToUpdate);

  //     expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
  //       storedUser.id,
  //     );

  //     expect(userRepositoryMock.findOneByEmail).not.toHaveBeenCalled();

  //     expect(hasherServiceMock.hash).not.toHaveBeenCalled();

  //     expect(userRepositoryMock.update).toHaveBeenCalledWith(
  //       storedUser.id,
  //       userDataToUpdate,
  //     );

  //     expect(result).toEqual(storedUpdatedUser);
  //   });

  //   it("Should update 'email' only", async () => {
  //     const storedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     const userDataToUpdate: IUpdateUserData = {
  //       name: undefined,
  //       email: "john_updated@email.com",
  //       password: undefined,
  //     };

  //     const storedUpdatedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john_updated@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(storedUser);

  //     jest.spyOn(userRepositoryMock, "findOneByEmail").mockResolvedValue(null);

  //     jest
  //       .spyOn(userRepositoryMock, "update")
  //       .mockResolvedValue(storedUpdatedUser);

  //     const result = await userService.update(storedUser.id, userDataToUpdate);

  //     expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
  //       storedUser.id,
  //     );

  //     expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
  //       userDataToUpdate.email,
  //     );

  //     expect(hasherServiceMock.hash).not.toHaveBeenCalled();

  //     expect(userRepositoryMock.update).toHaveBeenCalledWith(
  //       storedUser.id,
  //       userDataToUpdate,
  //     );

  //     expect(result).toEqual(storedUpdatedUser);
  //   });

  //   it("Should update 'password' only", async () => {
  //     const storedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     const hashedPassword = "hashedpassword";

  //     const storedUpdatedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     const userDataToUpdate: IUpdateUserData = {
  //       name: undefined,
  //       email: undefined,
  //       password: "updated_password123",
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(storedUser);

  //     jest.spyOn(hasherServiceMock, "hash").mockResolvedValue(hashedPassword);

  //     jest
  //       .spyOn(userRepositoryMock, "update")
  //       .mockResolvedValue(storedUpdatedUser);

  //     const result = await userService.update(storedUser.id, userDataToUpdate);

  //     expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
  //       storedUser.id,
  //     );

  //     expect(hasherServiceMock.hash).toHaveBeenCalledWith(
  //       userDataToUpdate.password,
  //     );

  //     expect(userRepositoryMock.update).toHaveBeenCalledWith(storedUser.id, {
  //       ...userDataToUpdate,
  //       password: hashedPassword,
  //     });

  //     expect(result).toEqual(storedUpdatedUser);
  //   });

  //   it("Should throw 'BadRequestException' when no data is provided", async () => {
  //     const storedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     const userDataToUpdate: IUpdateUserData = {
  //       name: undefined,
  //       email: undefined,
  //       password: undefined,
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(storedUser);

  //     const updateUserPromise = userService.update(
  //       storedUser.id,
  //       userDataToUpdate,
  //     );

  //     await expect(updateUserPromise).rejects.toThrow(
  //       /^Nenhum dado foi fornecido.$/,
  //     );

  //     await expect(updateUserPromise).rejects.toBeInstanceOf(
  //       BadRequestException,
  //     );

  //     expect(userRepositoryMock.findOneById).not.toHaveBeenCalled();

  //     expect(userRepositoryMock.findOneByEmail).not.toHaveBeenCalled();

  //     expect(hasherServiceMock.hash).not.toHaveBeenCalled();

  //     expect(userRepositoryMock.update).not.toHaveBeenCalled();
  //   });

  //   it("Should throw 'BadRequestException' when email already in use", async () => {
  //     const storedUser: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     const anotherStoredUser: IStoredUser = {
  //       id: "2",
  //       name: "Jane Doe",
  //       email: "jane@email.com",
  //       deletedAt: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       userCredentials: {
  //         id: "22",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     const userDataToUpdate: IUpdateUserData = {
  //       name: undefined,
  //       email: "jane@email.com",
  //       password: undefined,
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(storedUser);

  //     jest
  //       .spyOn(userRepositoryMock, "findOneByEmail")
  //       .mockResolvedValue(anotherStoredUser);

  //     const loginUserPromise = userService.update(
  //       storedUser.id,
  //       userDataToUpdate,
  //     );

  //     await expect(loginUserPromise).rejects.toThrow(
  //       /^Impossível atualizar o seu usuário. Verifique as suas credenciais e tente novamente.$/,
  //     );

  //     await expect(loginUserPromise).rejects.toBeInstanceOf(
  //       BadRequestException,
  //     );

  //     expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
  //       storedUser.id,
  //     );

  //     expect(userRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
  //       userDataToUpdate.email,
  //     );

  //     expect(hasherServiceMock.hash).not.toHaveBeenCalled();

  //     expect(userRepositoryMock.update).not.toHaveBeenCalled();
  //   });
  // });

  // describe("softDelete", () => {
  //   it("Should softly delete user", async () => {
  //     const userToDelete: IStoredUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       updatedAt: new Date(),
  //       createdAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         lastLoginAt: null,
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "findOneById")
  //       .mockResolvedValue(userToDelete);

  //     jest
  //       .spyOn(userRepositoryMock, "softDelete")
  //       .mockResolvedValue({ ...userToDelete, deletedAt: new Date() });

  //     const result = await userService.softDelete(userToDelete.id);

  //     expect(userRepositoryMock.findOneById).toHaveBeenCalledWith("1");

  //     expect(userRepositoryMock.softDelete).toHaveBeenCalledWith("1");

  //     expect(result.deletedAt).not.toBeNull();
  //   });

  //   it("Should throw 'NotFoundException' if user dont exist", async () => {
  //     jest.spyOn(userRepositoryMock, "findOneById").mockResolvedValue(null);

  //     const deleteUserPromise = userService.softDelete("unexistent-id");

  //     await expect(deleteUserPromise).rejects.toThrow(
  //       /^Impossível excluir esse usuário.$/,
  //     );

  //     await expect(deleteUserPromise).rejects.toBeInstanceOf(
  //       BadRequestException,
  //     );

  //     expect(userRepositoryMock.update).not.toHaveBeenCalled();
  //   });
  // });

  // describe("saveRefreshTokenAndLastLoginAt", () => {
  //   it("Should save lastLoginAt and refreshTokenHash after login", async () => {
  //     const userId = "1";
  //     const hashedRefreshToken = "hashed_refresh_token";

  //     const storedUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       updatedAt: new Date(),
  //       createdAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         userId: "1",
  //         passwordHash: "hashed_password",
  //         refreshTokenHash: "hashed_refresh_token",
  //         lastLoginAt: new Date(),
  //       },
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "saveRefreshTokenAndLastLoginAt")
  //       .mockResolvedValue(storedUser);

  //     const result = await userService.saveRefreshTokenAndLastLoginAt(
  //       userId,
  //       hashedRefreshToken,
  //     );

  //     expect(
  //       userRepositoryMock.saveRefreshTokenAndLastLoginAt,
  //     ).toHaveBeenCalledWith(userId, hashedRefreshToken);

  //     expect(result).toEqual(storedUser);
  //   });
  // });

  // describe("updateRefreshToken", () => {
  //   it("Should update refresh token", async () => {
  //     const userId = "1";
  //     const updatedRefreshTokenHash = "updated_refresh_token_hash";

  //     const storedUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       updatedAt: new Date(),
  //       createdAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         userId: "1",
  //         passwordHash: "hashed_password",
  //         refreshTokenHash: "updated_refresh_token_hash",
  //         lastLoginAt: new Date(),
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "updateRefreshToken")
  //       .mockResolvedValue(storedUser);

  //     const result = await userService.updateRefreshToken(
  //       userId,
  //       updatedRefreshTokenHash,
  //     );

  //     expect(userRepositoryMock.updateRefreshToken).toHaveBeenCalledWith(
  //       userId,
  //       updatedRefreshTokenHash,
  //     );

  //     expect(result).toEqual(storedUser);
  //   });

  //   it("Should update refresh to a null value", async () => {
  //     const userId = "1";
  //     const updatedRefreshTokenHash = null;

  //     const storedUser = {
  //       id: "1",
  //       name: "John Doe",
  //       email: "john@email.com",
  //       deletedAt: null,
  //       updatedAt: new Date(),
  //       createdAt: new Date(),
  //       userCredentials: {
  //         id: "11",
  //         userId: "1",
  //         passwordHash: "hashed_password",
  //         refreshTokenHash: null,
  //         lastLoginAt: new Date(),
  //       },
  //       roles: [
  //         {
  //           name: "USER",
  //         },
  //       ],
  //     };

  //     jest
  //       .spyOn(userRepositoryMock, "updateRefreshToken")
  //       .mockResolvedValue(storedUser);

  //     const result = await userService.updateRefreshToken(
  //       userId,
  //       updatedRefreshTokenHash,
  //     );

  //     expect(userRepositoryMock.updateRefreshToken).toHaveBeenCalledWith(
  //       userId,
  //       updatedRefreshTokenHash,
  //     );

  //     expect(result).toEqual(storedUser);
  //   });
  // });
});
