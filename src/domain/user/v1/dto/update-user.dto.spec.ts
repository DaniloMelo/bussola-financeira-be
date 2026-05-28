import { UpdateUserDtoV1 } from "./update-user.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

describe("UpdateUserDto V1", () => {
  const validUpdatedUser: UpdateUserDtoV1 = {
    name: "John Doe Updated",
    email: "john_updated@email.com",
    password: "passUpdated123",
  };

  it("Should remove invalid spaces from 'name'", async () => {
    const invalidUser: UpdateUserDtoV1 = {
      ...validUpdatedUser,
      name: "  John Doe Updated  ",
    };

    const instance = plainToInstance(UpdateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.name).toBe("John Doe Updated");
  });

  it("Should fail if 'name' contains white spaces only", async () => {
    const invalidUser: UpdateUserDtoV1 = {
      ...validUpdatedUser,
      name: "     ",
    };

    const instance = plainToInstance(UpdateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("name");
    expect(errors[0].constraints).toHaveProperty(
      "isNotEmpty",
      "Nome não pode ser espaços em branco.",
    );
  });

  it("Should fail if name contains XSS", async () => {
    const instance = plainToInstance(UpdateUserDtoV1, {
      name: "<script>alert('XSS')</script>John Doe",
    });

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("name");
    expect(errors[0].constraints).toHaveProperty(
      "IsSafeString",
      "Nome precisa conter caracteres válidos.",
    );
  });

  it("Should fail if name contains HTML injection", async () => {
    const instance = plainToInstance(UpdateUserDtoV1, {
      name: "<h1>John Doe</h1>",
    });

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("name");
    expect(errors[0].constraints).toHaveProperty(
      "IsSafeString",
      "Nome precisa conter caracteres válidos.",
    );
  });

  it("Should fail if name contains inline events handlers", async () => {
    const instance = plainToInstance(UpdateUserDtoV1, {
      name: "<img src=x onerror='alert(1)'>",
    });

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("name");
    expect(errors[0].constraints).toHaveProperty(
      "IsSafeString",
      "Nome precisa conter caracteres válidos.",
    );
  });

  it("Should remove invalid white spaces from 'password'", async () => {
    const invalidUser: UpdateUserDtoV1 = {
      ...validUpdatedUser,
      password: "  updated_password123  ",
    };

    const instance = plainToInstance(UpdateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.password).toBe("updated_password123");
  });

  it("Should fail if 'password' contains white spaces only", async () => {
    const invalidUser: UpdateUserDtoV1 = {
      ...validUpdatedUser,
      password: "        ",
    };

    const instance = plainToInstance(UpdateUserDtoV1, invalidUser);

    const errors = await validate(instance);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("password");
    expect(errors[0].constraints).toHaveProperty(
      "isNotEmpty",
      "Senha não pode ser espaços em branco.",
    );
  });
});
