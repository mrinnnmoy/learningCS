import { describe, it, expect } from "vitest";
import { truncate } from "./truncate";

describe("truncate", () => {
  it("returns the original text when shorter than maxLength", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("returns the original text when exactly equal to maxLength", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("truncates and appends ellipsis when longer than maxLength", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("returns an empty string when maxLength is 0", () => {
    expect(truncate("Hello", 0)).toBe("");
  });

  it("handles an empty input string", () => {
    expect(truncate("", 10)).toBe("");
  });

  it("handles maxLength of 1", () => {
    expect(truncate("Hello", 1)).toBe("H...");
  });
});
