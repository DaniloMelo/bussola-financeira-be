import { SanitizeService } from "./sanitize.service";

describe("SanitizeService", () => {
  const sanitizeService = new SanitizeService();

  describe("sanitizeText", () => {
    it("should remove HTML tags and return inside text only", () => {
      const input = "<a href='http://'>John Doe</a>";
      const result = sanitizeService.sanitizeText(input);
      expect(result).toBe("John Doe");
    });

    it("should remove the ‘script’ tags and their contents, keeping only what comes after them", () => {
      const input = "<script>alert(XSS)</script>John Doe";
      const result = sanitizeService.sanitizeText(input);
      expect(result).toBe("John Doe");
    });

    it("should remove event handlers", () => {
      const input = "<img src=x onerror='alert(1)'>John Doe";
      const result = sanitizeService.sanitizeText(input);
      expect(result).toBe("John Doe");
    });

    it("should keep text if not contais HTML tags", () => {
      const input = "John Doe";
      const result = sanitizeService.sanitizeText(input);
      expect(result).toBe("John Doe");
    });
  });

  describe("scapeHtml", () => {
    it("should escape special characters", () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizeService.escapeHtml(input);
      expect(result).toBe(
        "&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;",
      );
    });

    it("should escape '&' char", () => {
      const input = "John & Doe";
      const result = sanitizeService.escapeHtml(input);
      expect(result).toBe("John &amp; Doe");
    });
  });

  describe("removeUnicode", () => {
    it("should remove zero-width characters", () => {
      const input = "Jo\u200Bhn Doe";
      const result = sanitizeService.removeUnicode(input);
      expect(result).toBe("John Doe");
    });

    it("should remove ASCII/Unicode control characters", () => {
      const input = "Jo\0hn Doe";
      const result = sanitizeService.removeUnicode(input);
      expect(result).toBe("John Doe");
    });

    it("should normalize unicode characters to NFC", () => {
      const composed = "café";
      const decomposed = "cafe\u0301";
      expect(composed).not.toBe(decomposed);

      const normalizedComposed = sanitizeService.removeUnicode(composed);
      const normalizedDecomposed = sanitizeService.removeUnicode(decomposed);
      expect(normalizedComposed).toBe(normalizedDecomposed);
    });
  });
});
