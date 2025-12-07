import { IStoredUser } from "../interfaces/user";
import { UserService } from "../user.service";
import { CreateUserResponseDtoV1 } from "./dto/create-user-response.dto";
import { CreateUserDtoV1 } from "./dto/create-user.dto";
import { UserControllerV1 } from "./user.controller";

const userServiceMock: Partial<UserService> = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe("UserController V1", () => {
  let userController: UserControllerV1;

  beforeEach(() => {
    userController = new UserControllerV1(
      userServiceMock as unknown as UserService,
    );
  });

  it("Should call userService.create with correct arguments", async () => {
    const userInputDataMock: CreateUserDtoV1 = {
      name: "John Doe",
      email: "john@email.com",
      password: "pass123",
    };

    const serviceResponseMock: CreateUserResponseDtoV1 = {
      id: "34eaa6f3-4ff8-4f70-8acb-44b70436891b",
      name: "John Doe",
      email: "john@email.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      userCredentials: {
        id: "57efca6f3-12381-4f40-8acb-44b7036891csa",
        lastLoginAt: null,
      },
    };

    jest
      .spyOn(userServiceMock, "create")
      .mockResolvedValue(serviceResponseMock);

    const result = await userController.create(userInputDataMock);

    expect(userServiceMock.create).toHaveBeenCalledWith(userInputDataMock);
    expect(result).toEqual(serviceResponseMock);
  });

  it("Should call userService.findAll", async () => {
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

    jest.spyOn(userServiceMock, "findAll").mockResolvedValue(storedUsers);

    const result = await userController.findAll();

    expect(userServiceMock.findAll).toHaveBeenCalled();
    expect(result).toEqual(storedUsers);
  });
});
