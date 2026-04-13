import { describe, expect, it } from "vitest";
import extractErrors from "./extract-errors";

describe("extractErrors", () => {
  it("returns array input untouched", () => {
    const errors = ["field is required", "invalid format"];
    expect(extractErrors(errors)).toEqual(errors);
  });

  it("returns an empty array for an empty input array", () => {
    expect(extractErrors([])).toEqual([]);
  });

  it("flattens a Laravel-style validation error record", () => {
    const errors = {
      email: ["email is required", "email must be valid"],
      password: ["password is too short"],
    };
    expect(extractErrors(errors)).toEqual(["email is required", "email must be valid", "password is too short"]);
  });

  it("returns an empty array when all record values are empty arrays", () => {
    expect(extractErrors({ email: [], password: [] })).toEqual([]);
  });

  it("returns an empty array for an empty record", () => {
    expect(extractErrors({})).toEqual([]);
  });
});
