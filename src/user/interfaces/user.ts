export interface ICreateUser {
  name: string;
  email: string;
  password: string;
}

export interface IStoredUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  userCredentials: {
    id: string;
    lastLoginAt: Date | null;
  };
}
