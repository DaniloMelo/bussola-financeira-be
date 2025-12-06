import { plainToInstance } from "class-transformer";
import { CreateUserDtoV1 } from "./create-user.dto";
import { validate } from "class-validator";

const validUser: CreateUserDtoV1 = {
  name: "John Doe",
  email: "john@email.com",
  password: "password123",
};

describe("CreateUserDto V1", () => {
  it("Should pass all validations", async () => {
    const instance = plainToInstance(CreateUserDtoV1, validUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

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

  it("Should fail if 'name' contains less than '3' characters", async () => {
    const invalidUser = {
      ...validUser,
      name: "Jo",
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("name");
    expect(errors[0].constraints).toHaveProperty(
      "minLength",
      "Nome precisa ter o mínimo de 3 caracteres.",
    );
  });

  it("Should fail if 'name' contains more than '100' characters", async () => {
    const invalidUser = {
      ...validUser,
      name: "a".repeat(101),
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("name");
    expect(errors[0].constraints).toHaveProperty(
      "maxLength",
      "Nome pode ter no máximo 100 caracteres.",
    );
  });

  it("Should fail if 'email' is invalid", async () => {
    const invalidUser = {
      ...validUser,
      email: "invalid_email.com",
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("email");
    expect(errors[0].constraints).toHaveProperty("isEmail", "E-mail inválido.");
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

  it("Should fail if 'password' has less than 6 characters", async () => {
    const invalidUser = {
      ...validUser,
      password: "senha",
    };

    const instance = plainToInstance(CreateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("password");
    expect(errors[0].constraints).toHaveProperty(
      "minLength",
      "Senha precisa ter o mínimo de 6 caracteres.",
    );
  });
});
