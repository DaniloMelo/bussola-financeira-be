export type CreateUserParams = {
  name: string;
  email: string;
  password: string;
};

export type CreateUserResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  userCredentials: {
    id: string;
    lastLoginAt: Date | null;
  } | null;
};
