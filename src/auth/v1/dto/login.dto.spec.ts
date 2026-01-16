import { plainToInstance } from "class-transformer";
import { ILogin } from "src/auth/interfaces/login.interface";
import { LoginDtoV1 } from "./login.dto";
import { validate } from "class-validator";

describe("LoginDtoV1", () => {
  it("Should revome invalid white spaces from password", async () => {
    const invalidUser: ILogin = {
      email: "john@email.com",
      password: "  password123  ",
    };

    const instance = plainToInstance(LoginDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.password).toBe("password123");
  });

  it("Should fail if passwor contains white spaces only", async () => {
    const invalidUser: ILogin = {
      email: "John@email.com",
      password: "        ",
    };

    const instance = plainToInstance(LoginDtoV1, invalidUser);

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
