import { UserService } from "../user.service";
import { CreateUserDtoV2 } from "./dto/create-user.dto";
import { UserControllerV2 } from "./user.controller";

const userServiceMock: Partial<UserService> = {
  create: jest.fn(),
};

describe("UserController V2", () => {
  let userController: UserControllerV2;

  beforeEach(() => {
    userController = new UserControllerV2(
      userServiceMock as unknown as UserService,
    );
  });

  it("Should call userService.create with correct arguments", async () => {
    const userInputDataMock: CreateUserDtoV2 = {
      userName: "John Doe",
      userEmail: "john@email.com",
      userPassword: "password123",
    };

    const serviceResponseMock = {
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

    expect(userServiceMock.create).toHaveBeenCalledWith({
      name: userInputDataMock.userName,
      email: userInputDataMock.userEmail,
      password: userInputDataMock.userPassword,
    });

    expect(result).toEqual({
      id: serviceResponseMock.id,
      userName: serviceResponseMock.name,
      userEmail: serviceResponseMock.email,
      createdAt: serviceResponseMock.createdAt,
      updatedAt: serviceResponseMock.updatedAt,
      userCredentials: {
        id: serviceResponseMock.userCredentials.id,
        lastLoginAt: serviceResponseMock.userCredentials.lastLoginAt,
      },
    });
  });
});
