import { ActivationCodeProtocol } from "src/common/activation-code/activation-code.protocol";
import { UserRepository } from "../repositories/user.repository";
import { UserActivationService } from "./user-activation.service";
import { Test, TestingModule } from "@nestjs/testing";

const mockUserRepository = {
  findActivationCode: jest.fn(),
  updateActivationCodeAttempts: jest.fn(),
  activateUser: jest.fn(),
};

const mockActivationCodeService = {
  // generate: jest.fn(),
  // hash: jest.fn(),
  verify: jest.fn(),
  // generateExp: jest.fn(),
  verifyExp: jest.fn(),
};

describe("UserActivationService", () => {
  let userActivationService: UserActivationService;
  let userRepositoryMock: UserRepository;
  let activationCodeServiceMock: ActivationCodeProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserActivationService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ActivationCodeProtocol,
          useValue: mockActivationCodeService,
        },
      ],
    }).compile();

    userRepositoryMock = module.get<UserRepository>(UserRepository);
    activationCodeServiceMock = module.get<ActivationCodeProtocol>(
      ActivationCodeProtocol,
    );
  });

  describe("activateUser", () => {
    it("", () => {
      expect(1).toBe(1);
    });
  });
});
