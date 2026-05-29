export abstract class SanitizeProtocol {
  abstract sanitizeText(input: string): string;
  abstract escapeHtml(input: string): string;
  abstract removeUnicode(input: string): string;
}
