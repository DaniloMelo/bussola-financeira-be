import { plainToInstance } from "class-transformer";
import { CreateUserDtoV1 } from "./create-user.dto";
import { validate } from "class-validator";

const validUser: CreateUserDtoV1 = {
  name: "John Doe",
  email: "john@email.com",
  password: "password123",
};

describe("CreateUserDto V1", () => {
  it("Should remove invalid spaces from 'name'", async () => {
    const invalidUser = {
      ...validUser,
      name: " John Doe ",
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.name).toBe("John Doe");
  });

  it("Should fail if 'name' contains white spaces only", async () => {
    const invalidUser = {
      ...validUser,
      name: "   ",
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("name");
    expect(errors[0].constraints).toHaveProperty(
      "isNotEmpty",
      "Nome não pode ser espaços em branco.",
    );
  });

  it("Should remove invalid spaces from 'password'", async () => {
    const invalidUser = {
      ...validUser,
      password: " senha123 ",
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.password).toBe("senha123");
  });

  it("Should fail if 'password' contains white spaces only", async () => {
    const invalidUser = {
      ...validUser,
      password: "       ",
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("password");
    expect(errors[0].constraints).toHaveProperty(
      "minLength",
      "Senha precisa ter o mínimo de 6 caracteres.",
    );
    expect(errors[0].constraints).toHaveProperty(
      "isNotEmpty",
      "Senha não pode ser espaços em branco.",
    );
  });
});
