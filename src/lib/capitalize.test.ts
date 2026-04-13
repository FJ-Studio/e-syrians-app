import { describe, expect, it } from "vitest";
import capitalize from "./capitalize";

describe("capitalize", () => {
  it("uppercases the first letter and lowercases the rest", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("normalizes mixed case to Title case", () => {
    expect(capitalize("hELLO")).toBe("Hello");
  });

  it("lowercases an all-uppercase word", () => {
    expect(capitalize("WORLD")).toBe("World");
  });

  it("leaves a single lowercase character uppercased", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("returns an empty string for empty input", () => {
    expect(capitalize("")).toBe("");
  });

  it("does not trim surrounding whitespace", () => {
    expect(capitalize(" foo")).toBe(" foo");
  });
});
