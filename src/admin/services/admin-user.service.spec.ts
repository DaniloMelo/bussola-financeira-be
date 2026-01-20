/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { AdminUserRepository } from "../repositories/admin-user.repository";
import { AdminUserService } from "./admin-user.service";

const adminUserRepositoryMock = {
  findAll: jest.fn(),
};

describe("AdminUserService", () => {
  let adminUserService: AdminUserService;
  let adminUserRepository: AdminUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserService,
        {
          provide: AdminUserRepository,
          useValue: adminUserRepositoryMock,
        },
      ],
    }).compile();

    adminUserService = module.get<AdminUserService>(AdminUserService);
    adminUserRepository = module.get<AdminUserRepository>(AdminUserRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("Should return all stored users", async () => {
      const storedUser1 = {
        id: "1",
        name: "John Doe",
        email: "john@email.com",
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          lastLoginAt: new Date(),
        },
        roles: [
          {
            name: "USER",
          },
        ],
      };

      const storedUser2 = {
        id: "2",
        name: "Mary",
        email: "mary@email.com",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCredentials: {
          lastLoginAt: new Date(),
        },
        roles: [
          {
            name: "ADMIN",
          },
        ],
      };

      jest
        .spyOn(adminUserRepository, "findAll")
        .mockResolvedValue([storedUser1, storedUser2]);

      const result = await adminUserService.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual([storedUser1, storedUser2]);

      expect(adminUserRepository.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
    });
  });
});
