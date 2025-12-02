/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from "@nestjs/testing";
import { TesteRepository } from "./teste.repository";
import { TesteService } from "./teste.service";
import {
  CreateUserParams,
  CreateUserResponse,
} from "./interfaces/user.interface";

describe("TesteService", () => {
  let testeService: TesteService;
  let testeRepository: TesteRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TesteService,
        {
          provide: TesteRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    testeService = module.get<TesteService>(TesteService);
    testeRepository = module.get<TesteRepository>(TesteRepository);
  });

  it("Should successfully create a user", async () => {
    const userInputMockData: CreateUserParams = {
      name: "John Doe",
      email: "john@email.com",
      password: "123456",
    };

    const userStoredMock: CreateUserResponse = {
      id: "123",
      name: "John Doe",
      email: "john@email.com",
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userCredentials: {
        id: "321",
        lastLoginAt: null,
      },
    };

    jest.spyOn(testeRepository, "create").mockResolvedValue(userStoredMock);

    const result = await testeService.createUser(userInputMockData);

    expect(testeRepository.create).toHaveBeenCalledWith(userInputMockData);
    expect(result).toEqual(userStoredMock);
  });
});
