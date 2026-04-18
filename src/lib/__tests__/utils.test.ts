import { describe, it, expect } from "vitest";
import { cn, formatDuration, formatCurrency, generateShareToken } from "../utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false && "bar", undefined, null as never, "baz")).toBe(
      "foo baz"
    );
  });

  it("handles conditional objects", () => {
    expect(cn({ "font-bold": true, "font-normal": false })).toBe("font-bold");
  });

  it("returns empty string when no truthy inputs", () => {
    expect(cn(false as never, undefined, null as never)).toBe("");
  });
});

describe("formatDuration()", () => {
  it("shows only seconds when under 1 minute", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(30)).toBe("30s");
    expect(formatDuration(59)).toBe("59s");
  });

  it("shows minutes and seconds at 60s", () => {
    expect(formatDuration(60)).toBe("1m 0s");
  });

  it("shows minutes and seconds for typical wait times", () => {
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(125)).toBe("2m 5s");
  });

  it("handles exactly 1 hour", () => {
    expect(formatDuration(3600)).toBe("60m 0s");
  });
});

describe("formatCurrency()", () => {
  it("formats zero as THB currency", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
    expect(result).toMatch(/฿|THB|บาท/);
  });

  it("formats whole numbers", () => {
    const result = formatCurrency(100);
    expect(result).toContain("100");
  });

  it("formats decimal amounts", () => {
    const result = formatCurrency(99.5);
    expect(result).toContain("99");
  });

  it("formats large amounts with separators", () => {
    const result = formatCurrency(10000);
    expect(result).toContain("10");
    expect(result).toContain("000");
  });
});

describe("generateShareToken()", () => {
  const SAFE_CHARS = new Set(
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789".split("")
  );

  it("returns a string of exactly 8 characters", () => {
    expect(generateShareToken()).toHaveLength(8);
  });

  it("only uses characters from the safe alphabet (no 0, 1, I, O, l)", () => {
    for (let i = 0; i < 20; i++) {
      const token = generateShareToken();
      for (const char of token) {
        expect(SAFE_CHARS.has(char)).toBe(true);
      }
    }
  });

  it("never contains ambiguous characters 0, 1, I, O, l", () => {
    for (let i = 0; i < 50; i++) {
      const token = generateShareToken();
      expect(token).not.toMatch(/[0OIl1]/);
    }
  });

  it("produces different tokens across calls", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateShareToken()));
    // With 56^8 combinations, 20 should all be unique
    expect(tokens.size).toBeGreaterThan(1);
  });
});
