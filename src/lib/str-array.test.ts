import { describe, expect, it } from "vitest";
import strToArray from "./str-array";

describe("strToArray", () => {
  it("returns an array input unchanged", () => {
    const input = ["a", "b", "c"];
    expect(strToArray(input)).toBe(input);
  });

  it("splits a comma-separated string with the default delimiter", () => {
    expect(strToArray("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("splits on a custom delimiter", () => {
    expect(strToArray("a|b|c", "|")).toEqual(["a", "b", "c"]);
  });

  it("returns a single-element array when the delimiter is absent", () => {
    expect(strToArray("solo")).toEqual(["solo"]);
  });

  it("preserves empty segments around delimiters", () => {
    // Matches native String.prototype.split behavior — leading/trailing/
    // adjacent delimiters produce empty strings rather than being collapsed.
    expect(strToArray(",a,,b,")).toEqual(["", "a", "", "b", ""]);
  });

  it("returns an array containing one empty string for an empty string input", () => {
    expect(strToArray("")).toEqual([""]);
  });
});
