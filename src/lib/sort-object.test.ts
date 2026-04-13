import { describe, expect, it } from "vitest";
import { sortObject } from "./sort-object";

describe("sortObject", () => {
  it("sorts entries alphabetically by value, preserving keys", () => {
    const input = { c: "Cherry", a: "Apple", b: "Banana" };
    const sorted = sortObject(input);
    expect(Object.entries(sorted)).toEqual([
      ["a", "Apple"],
      ["b", "Banana"],
      ["c", "Cherry"],
    ]);
  });

  it("uses locale-aware comparison (Arabic)", () => {
    const input = { ksa: "السعودية", syr: "سوريا", egy: "مصر" };
    const sorted = sortObject(input);
    const values = Object.values(sorted);
    // Verify the values come out in the Arabic collation order — whatever
    // Intl's localeCompare emits deterministically for this set.
    expect(values).toEqual([...values].sort((a, b) => a.localeCompare(b)));
  });

  it("returns an empty object for empty input", () => {
    expect(sortObject({})).toEqual({});
  });

  it("keeps a single entry untouched", () => {
    expect(sortObject({ only: "value" })).toEqual({ only: "value" });
  });

  it("preserves key associations after sorting", () => {
    const input = { z: "beta", a: "alpha" };
    const sorted = sortObject(input);
    expect(sorted.a).toBe("alpha");
    expect(sorted.z).toBe("beta");
    // Key order follows value order.
    expect(Object.keys(sorted)).toEqual(["a", "z"]);
  });
});
