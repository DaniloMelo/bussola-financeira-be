/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "../repositories/user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { BadRequestException } from "@nestjs/common";
import { ICreateUser } from "../interfaces/user";
import { EmailService } from "src/infra/email/services/email.service";
import { SanitizeService } from "src/common/sanitize/sanitize.service";
import { SanitizeProtocol } from "src/common/sanitize/sanitize.protocol";

const mockUserRepository = {
  create: jest.fn(),
  findOneByEmail: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        id: "1",
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

      expect(userRepositoryMock.create).toHaveBeenCalledWith({
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

      expect(sanitizeServiceMock.sanitizeAll).toHaveBeenCalledWith(input.name);

      expect(userRepositoryMock.create).toHaveBeenCalledWith({
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

  describe("findAll", () => {
    it("should return an array of users", async () => {
      mockUserRepository.findAll.mockResolvedValue([createMockStoredUser()]);

      const result = await userService.findAll();

      expect(userRepositoryMock.findAll).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject([
        {
          id: "1",
          name: "John Doe",
          email: "john@email.com",
          userCredentials: { id: "11", lastLoginAt: null },
          roles: [{ name: "USER" }],
        },
      ]);
    });

    it("should return an empty array if no users where found or exists", async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await userService.findAll();

      expect(userRepositoryMock.findAll).toHaveBeenCalledTimes(1);

      expect(result.length).toBe(0);
    });
  });

  describe("findMe", () => {
    it("should return my user when authenticated", async () => {
      mockUserRepository.findOneById.mockResolvedValue(createMockStoredUser());

      const userId = "1";

      const result = await userService.findMe(userId);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(userId);

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: { id: "11", lastLoginAt: null },
        roles: [{ name: "USER" }],
      });
    });

    it("should return null if user dont exist", async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);

      const unexistentUserId = "1";

      const result = await userService.findMe(unexistentUserId);

      expect(userRepositoryMock.findOneById).toHaveBeenCalledWith(
        unexistentUserId,
      );

      expect(result).toBe(null);
    });
  });

  describe("update", () => {
    function createMocksDefaultSetup() {
      mockUserRepository.findOneById.mockResolvedValue(createMockStoredUser());
      mockSanitizeService.sanitizeAll.mockReturnValue("Updated John Doe");
      mockUserRepository.findOneByEmail.mockResolvedValue(null);
      mockHasherService.hash.mockResolvedValue("Updated-hashed-password123");
      const updatedUserMock = createMockStoredUser({
        name: "Updated John Doe",
        email: "updated_john@email.com",
      });
      mockUserRepository.update.mockResolvedValue(updatedUserMock);
    }

    it("should successfully update all properties", async () => {
      createMocksDefaultSetup();

      const userId = "1";
      const input = createUserInput({
        name: "Updated John Doe",
        email: "updated_john@email.com",
        password: "Updated-plain-text-password123",
      });
      const result = await userService.update(userId, input);

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        name: "Updated John Doe",
        email: "updated_john@email.com",
        password: "Updated-hashed-password123",
      });

      expect(result).toMatchObject({
        id: "1",
        name: "Updated John Doe",
        email: "updated_john@email.com",
        userCredentials: { id: "11", lastLoginAt: null },
        roles: [{ name: "USER" }],
      });

      expect(result).not.toHaveProperty("password");
    });

    it("should update 'name' only", async () => {
      createMocksDefaultSetup();
      mockUserRepository.update.mockResolvedValue(
        createMockStoredUser({ name: "Updated John Doe" }),
      );

      const userId = "1";
      const input = createUserInput({
        name: "Updated John Doe",
        email: undefined,
        password: undefined,
      });
      const result = await userService.update(userId, input);

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        name: "Updated John Doe",
        email: undefined,
        password: undefined,
      });

      expect(result).toMatchObject({
        id: "1",
        name: "Updated John Doe",
        email: "john@email.com",
        userCredentials: { id: "11", lastLoginAt: null },
        roles: [{ name: "USER" }],
      });
    });

    it("should sanitize 'name' before update", async () => {
      createMocksDefaultSetup();

      const userId = "1";
      const input = createUserInput({
        name: "<script>alert('XSS')</script>Updated John Doe",
        email: undefined,
        password: undefined,
      });
      await userService.update(userId, input);

      expect(sanitizeServiceMock.sanitizeAll).toHaveBeenCalledWith(
        "<script>alert('XSS')</script>Updated John Doe",
      );

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        name: "Updated John Doe",
        email: undefined,
        password: undefined,
      });
    });

    it("should throw 'BadRequestException' when sanitize fail", async () => {
      createMocksDefaultSetup();
      mockSanitizeService.sanitizeAll.mockReturnValue("");

      const input = createUserInput({
        name: "<script>alert('XSS')</script>",
        email: undefined,
        password: undefined,
      });
      const createUserPromise = userService.update("1", input);

      await expect(createUserPromise).rejects.toThrow(
        /^Nome precisa conter caracteres válidos.$/,
      );

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });

    it("should update 'email' only", async () => {
      createMocksDefaultSetup();
      mockUserRepository.update.mockResolvedValue(
        createMockStoredUser({ email: "updated_john@email.com" }),
      );

      const userId = "1";
      const input = createUserInput({
        name: undefined,
        email: "updated_john@email.com",
        password: undefined,
      });

      const result = await userService.update(userId, input);

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        name: undefined,
        email: "updated_john@email.com",
        password: undefined,
      });

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "updated_john@email.com",
        userCredentials: { id: "11", lastLoginAt: null },
        roles: [{ name: "USER" }],
      });
    });

    it("should throw 'BadRequestException' when email already in use", async () => {
      createMocksDefaultSetup();
      const alreadyExistentUser = createMockStoredUser({
        id: "2",
        name: "Jane Doe",
        email: "jane@email.com",
        userCredentials: {
          id: "22",
          lastLoginAt: null,
        },
      });
      mockUserRepository.findOneByEmail.mockResolvedValue(alreadyExistentUser);

      const userId = "1";
      const input = createUserInput({
        name: undefined,
        email: "jane@email.com",
        password: undefined,
      });
      const updateUserPromise = userService.update(userId, input);

      await expect(updateUserPromise).rejects.toThrow(
        /^Impossível atualizar o seu usuário. Verifique as suas credenciais e tente novamente.$/,
      );

      await expect(updateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });

    it("should update 'password' only", async () => {
      createMocksDefaultSetup();
      mockUserRepository.update.mockResolvedValue(
        createMockStoredUser({ name: "John Doe", email: "john@email.com" }),
      );

      const userId = "1";
      const input = createUserInput({
        name: undefined,
        email: undefined,
        password: "Updated-plain-text-password123",
      });
      const result = await userService.update(userId, input);

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        name: undefined,
        email: undefined,
        password: "Updated-hashed-password123",
      });

      expect(result).toMatchObject({
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        userCredentials: { id: "11", lastLoginAt: null },
        roles: [{ name: "USER" }],
      });

      expect(result).not.toHaveProperty("password");
    });

    it("should hash password before update", async () => {
      createMocksDefaultSetup();
      mockUserRepository.update.mockResolvedValue(
        createMockStoredUser({ name: "John Doe", email: "john@email.com" }),
      );

      const userId = "1";
      const input = createUserInput({
        name: undefined,
        email: undefined,
        password: "Updated-plain-text-password123",
      });

      await userService.update(userId, input);

      expect(hasherServiceMock.hash).toHaveBeenCalledWith(input.password);

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        name: undefined,
        email: undefined,
        password: "Updated-hashed-password123",
      });
    });

    it("should throw 'BadRequestException' when no data is provided", async () => {
      createMockStoredUser();

      const userId = "1";
      const input = createUserInput({
        name: undefined,
        email: undefined,
        password: undefined,
      });

      const updateUserPromise = userService.update(userId, input);

      await expect(updateUserPromise).rejects.toThrow(
        /^Nenhum dado foi fornecido.$/,
      );

      await expect(updateUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe("softDelete", () => {
    it("should softly delete user", async () => {
      const userToDelete = createMockStoredUser({
        deletedAt: new Date(),
      });
      const userId = "1";

      mockUserRepository.findOneById.mockResolvedValue(createMockStoredUser());
      mockUserRepository.softDelete.mockResolvedValue(userToDelete);

      const result = await userService.softDelete(userId);

      expect(userRepositoryMock.softDelete).toHaveBeenCalledWith(userId);

      expect(result.deletedAt).not.toBeNull();
    });

    it("should throw 'NotFoundException' if user dont exist", async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);

      const deleteUserPromise = userService.softDelete("unexistent-id");

      await expect(deleteUserPromise).rejects.toThrow(
        /^Impossível excluir esse usuário.$/,
      );

      await expect(deleteUserPromise).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepositoryMock.softDelete).not.toHaveBeenCalled();
    });
  });
});
