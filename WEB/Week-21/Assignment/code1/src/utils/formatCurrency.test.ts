import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats a whole number in USD", () => {
    expect(formatCurrency(1999)).toBe("$1,999.00");
  });

  it("formats a decimal number", () => {
    expect(formatCurrency(9.99)).toBe("$9.99");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats a large number with comma separators", () => {
    expect(formatCurrency(1_000_000)).toBe("$1,000,000.00");
  });

  it("formats EUR correctly", () => {
    expect(formatCurrency(100, "EUR")).toBe("€100.00");
  });

  it("rounds to 2 decimal places", () => {
    // 10.005 rounds to 10.01 in standard rounding
    expect(formatCurrency(10.005)).toBe("$10.01");
  });
});
