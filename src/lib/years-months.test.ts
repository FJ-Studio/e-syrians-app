import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import getYearsMonths from "./years-months";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

describe("getYearsMonths", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a single month when start and current date are the same month", () => {
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const result = getYearsMonths(2024, 6, MONTHS);
    expect(result).toEqual({
      2024: [{ index: "06", name: "June" }],
    });
  });

  it("expands through consecutive months within a single year", () => {
    vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
    const result = getYearsMonths(2024, 1, MONTHS);
    expect(result[2024]).toEqual([
      { index: "01", name: "January" },
      { index: "02", name: "February" },
      { index: "03", name: "March" },
    ]);
  });

  it("rolls over December into the next January", () => {
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    const result = getYearsMonths(2023, 11, MONTHS);
    expect(result[2023]).toEqual([
      { index: "11", name: "November" },
      { index: "12", name: "December" },
    ]);
    expect(result[2024]).toEqual([{ index: "01", name: "January" }]);
  });

  it("returns an empty object when the start date is in the future", () => {
    vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
    expect(getYearsMonths(2024, 6, MONTHS)).toEqual({});
  });

  it("keeps months ordered within each year", () => {
    vi.setSystemTime(new Date("2024-06-01T00:00:00Z"));
    const result = getYearsMonths(2024, 1, MONTHS);
    const indices = result[2024].map((m) => m.index);
    expect(indices).toEqual(["01", "02", "03", "04", "05", "06"]);
  });

  it("uses the provided month-name array for localization", () => {
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    const ar = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    expect(getYearsMonths(2024, 1, ar)).toEqual({
      2024: [{ index: "01", name: "يناير" }],
    });
  });
});
