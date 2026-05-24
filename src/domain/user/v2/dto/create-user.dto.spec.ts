import { plainToInstance } from "class-transformer";
import { CreateUserDtoV2 } from "./create-user.dto";
import { validate } from "class-validator";

const validUser: CreateUserDtoV2 = {
  userName: "John Doe",
  userEmail: "john@email.com",
  userPassword: "password123",
};

describe("CreateUserDto V2", () => {
  it("Should remove invalid spaces from 'userName'", async () => {
    const invalidUser: CreateUserDtoV2 = {
      ...validUser,
      userName: " John Doe ",
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.userName).toBe("John Doe");
  });

  it("Should fail if 'userName' contains white spaces only", async () => {
    const invalidUser: CreateUserDtoV2 = {
      ...validUser,
      userName: "   ",
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("userName");
    expect(errors[0].constraints).toHaveProperty(
      "isNotEmpty",
      "Nome não pode ser espaços em branco.",
    );
  });

  it("Should remove invalid spaces from 'userPassword'", async () => {
    const invalidUser = {
      ...validUser,
      userPassword: " senha123 ",
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.userPassword).toBe("senha123");
  });

  it("Should fail if 'userPassword' contains white spaces only", async () => {
    const invalidUser: CreateUserDtoV2 = {
      ...validUser,
      userPassword: "       ",
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("userPassword");
    expect(errors[0].constraints).toHaveProperty(
      "isNotEmpty",
      "Senha não pode ser espaços em branco.",
    );
  });
});
