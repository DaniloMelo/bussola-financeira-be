export abstract class ActivationCodeProtocol {
  abstract generate(): string;
  abstract hash(code: string): string;
  abstract verify(code: string, hash: string): boolean;
  abstract generateExp(): Date;
  abstract verifyExp(exp: Date): boolean;
}
