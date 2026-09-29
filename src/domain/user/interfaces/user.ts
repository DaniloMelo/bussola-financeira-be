export interface ICreateUser {
  name: string;
  email: string;
  password: string;
}

export interface IStoredUser {
  id: string;
  name: string;
  email: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userCredentials: {
    id: string;
    lastLoginAt: Date | null;
  };
  roles: [
    {
      name: string;
    },
  ];
}

export interface UserWithCredentials {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  userCredentials: {
    passwordHash: string;
    refreshTokenHash: string | null;
  } | null;
  roles: {
    name: string;
  }[];
}
