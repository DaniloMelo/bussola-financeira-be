export abstract class HasherProtocol {
  abstract hash(rawText: string): Promise<string>;
  abstract compare(rawText: string, textHash: string): Promise<boolean>;
}
