export interface IUpdateActivationCode {
  email: string;
  activationCode: string;
  activationCodeAttempts: number;
  activationCodeExp: Date;
}
