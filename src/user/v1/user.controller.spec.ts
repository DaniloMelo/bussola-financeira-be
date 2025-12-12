import { IStoredUser } from "../interfaces/user";
import { UserService } from "../user.service";
import { CreateUserResponseDtoV1 } from "./dto/create-user-response.dto";
import { CreateUserDtoV1 } from "./dto/create-user.dto";
import { UserControllerV1 } from "./user.controller";

const userServiceMock: Partial<UserService> = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
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

  it("Should call userService.update with correct arguments", async () => {
    const userInputDataMock: CreateUserDtoV1 = {
      name: "John Doe Updated",
      email: "john_updated@email.com",
      password: "pass_updated123",
    };

    const serviceResponseMock: CreateUserResponseDtoV1 = {
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

    jest
      .spyOn(userServiceMock, "update")
      .mockResolvedValue(serviceResponseMock);

    const result = await userController.update("1", userInputDataMock);

    expect(userServiceMock.update).toHaveBeenCalledWith("1", userInputDataMock);

    expect(result).toEqual(serviceResponseMock);
  });
});
