import { plainToInstance } from "class-transformer";
import { CreateUserDtoV2 } from "./create-user.dto";
import { validate } from "class-validator";

const validUser: CreateUserDtoV2 = {
  userName: "John Doe",
  userEmail: "john@email.com",
  userPassword: "password123",
};

describe("CreateUserDto V2", () => {
  it("Should pass all validations", async () => {
    const instance = plainToInstance(CreateUserDtoV2, validUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

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

  it("Should fail if 'userName' contains less than 3 characters", async () => {
    const invalidUser: CreateUserDtoV2 = {
      ...validUser,
      userName: "Jo",
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("userName");
    expect(errors[0].constraints).toHaveProperty(
      "minLength",
      "Nome precisa ter o mínimo de 3 caracteres.",
    );
  });

  it("Shoult fail if 'userName' contains more than '100' characters", async () => {
    const invalidUser: CreateUserDtoV2 = {
      ...validUser,
      userName: "a".repeat(101),
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("userName");
    expect(errors[0].constraints).toHaveProperty(
      "maxLength",
      "Nome pode ter no máximo 100 caracteres.",
    );
  });

  it("Should fail if 'userEmail' is invalid", async () => {
    const invalidUser: CreateUserDtoV2 = {
      ...validUser,
      userEmail: "invalid_email",
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("userEmail");
    expect(errors[0].constraints).toHaveProperty("isEmail", "E-mail inválido.");
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

  it("Should if 'userPassword' contains less than 6 characters", async () => {
    const invalidUser: CreateUserDtoV2 = {
      ...validUser,
      userPassword: "pass",
    };

    const instance = plainToInstance(CreateUserDtoV2, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("userPassword");
    expect(errors[0].constraints).toHaveProperty(
      "minLength",
      "Senha precisa ter o mínimo de 6 caracteres.",
    );
  });
});
