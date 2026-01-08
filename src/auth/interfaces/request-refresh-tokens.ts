export interface IRequestRefreshToken {
  user: {
    sub: string;
    refreshToken: string;
  };
}
