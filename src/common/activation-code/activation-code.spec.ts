import { ActivationCodeService } from "./activation-code.service";

describe("ActivationCodeService", () => {
  const activationCodeService = new ActivationCodeService();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("generate", () => {
    it("should generate random code", () => {
      const result = activationCodeService.generate();

      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(typeof result).toBe("string");
    });

    it("should generate random code between 1 and 999999", () => {
      const result = activationCodeService.generate();

      expect(Number(result) >= 1).toBeTruthy();
      expect(Number(result) <= 999999).toBeTruthy();
    });

    it("should generate aways 6 lenght code", () => {
      const result = activationCodeService.generate();

      expect(result.toString().length).toBe(6);
    });
  });

  describe("hash", () => {
    it("should hash code", () => {
      const code = activationCodeService.generate();
      const hash = activationCodeService.hash(code);

      expect(code).not.toEqual(hash);
      expect(typeof hash).toBe("string");
    });

    it("should not generate empty string", () => {
      const code = activationCodeService.generate();
      const hash = activationCodeService.hash(code);

      expect(hash.trim().length > 1).toBeTruthy();
    });
  });

  describe("verify", () => {
    it("should return true if the hash is valid", () => {
      const code = activationCodeService.generate();
      const hash = activationCodeService.hash(code);
      const result = activationCodeService.verify(code, hash);

      expect(result).toBeTruthy();
    });

    it("should return false if the code is not valid", () => {
      const code = activationCodeService.generate();
      const hash = activationCodeService.hash(code);
      const result = activationCodeService.verify("invalid", hash);

      expect(result).toBeFalsy();
    });
  });

  describe("generateExp", () => {
    it("should generate expiration time", () => {
      const baseDate = new Date("2026-09-16T10:00:00.000Z");
      jest.setSystemTime(baseDate);

      const result = activationCodeService.generateExp();

      const expectedDate = new Date("2026-09-16T10:15:00.000Z");
      expect(result.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe("verifyExp", () => {
    it("should return true if expiration time is valid", () => {
      const baseDate = new Date("2026-09-16T10:00:00.000Z");
      jest.setSystemTime(baseDate);
      const exp = activationCodeService.generateExp();
      jest.advanceTimersByTime(14 * 60 * 1000);

      const result = activationCodeService.verifyExp(exp);

      expect(result).toBe(true);
    });

    it("should return false if expiration time is not valid", () => {
      const baseDate = new Date("2026-09-16T10:00:00.000Z");
      jest.setSystemTime(baseDate);
      const exp = activationCodeService.generateExp();
      jest.advanceTimersByTime(16 * 60 * 1000);

      const result = activationCodeService.verifyExp(exp);

      expect(result).toBe(false);
    });
  });
});
