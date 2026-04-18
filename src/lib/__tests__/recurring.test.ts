import { describe, it, expect } from "vitest";
import { parseRecurringRule, getNextSessionDate } from "../recurring";

// Helper: create a date for a specific weekday in 2025
// Week of 2025-01-06: Mon=6, Tue=7, Wed=8, Thu=9, Fri=10, Sat=11, Sun=12
const monday = new Date("2025-01-06T09:00:00");    // getDay() = 1
const tuesday = new Date("2025-01-07T09:00:00");   // getDay() = 2
const wednesday = new Date("2025-01-08T09:00:00"); // getDay() = 3
const friday = new Date("2025-01-10T09:00:00");    // getDay() = 5
const saturday = new Date("2025-01-11T09:00:00");  // getDay() = 6
const sunday = new Date("2025-01-12T09:00:00");    // getDay() = 0

describe("parseRecurringRule()", () => {
  describe("WEEKLY rules", () => {
    it("parses a single day", () => {
      const result = parseRecurringRule("WEEKLY:MON");
      expect(result.type).toBe("WEEKLY");
      expect(result.values).toEqual([1]); // MON=1
    });

    it("parses multiple days sorted ascending", () => {
      const result = parseRecurringRule("WEEKLY:WED,MON");
      expect(result.type).toBe("WEEKLY");
      expect(result.values).toEqual([1, 3]); // MON=1, WED=3
    });

    it("parses all standard day abbreviations", () => {
      const { values } = parseRecurringRule("WEEKLY:SUN,MON,TUE,WED,THU,FRI,SAT");
      expect(values).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it("is case-insensitive", () => {
      const result = parseRecurringRule("WEEKLY:mon,WED");
      expect(result.values).toEqual([1, 3]);
    });

    it("trims whitespace around day names", () => {
      const result = parseRecurringRule("WEEKLY:MON , WED");
      expect(result.values).toEqual([1, 3]);
    });

    it("throws for an invalid day abbreviation", () => {
      expect(() => parseRecurringRule("WEEKLY:XYZ")).toThrow();
    });
  });

  describe("MONTHLY rules", () => {
    it("parses a single day-of-month", () => {
      const result = parseRecurringRule("MONTHLY:15");
      expect(result.type).toBe("MONTHLY");
      expect(result.values).toEqual([15]);
    });

    it("parses multiple days sorted ascending", () => {
      const result = parseRecurringRule("MONTHLY:15,1");
      expect(result.type).toBe("MONTHLY");
      expect(result.values).toEqual([1, 15]);
    });

    it("trims whitespace", () => {
      const result = parseRecurringRule("MONTHLY:1 , 15");
      expect(result.values).toEqual([1, 15]);
    });
  });

  it("throws for unknown type", () => {
    expect(() => parseRecurringRule("DAILY:MON")).toThrow();
  });

  it("throws for missing colon separator", () => {
    expect(() => parseRecurringRule("WEEKLY")).toThrow();
  });
});

describe("getNextSessionDate() — WEEKLY rules", () => {
  it("returns next Wednesday when today is Monday (MON,WED rule)", () => {
    const next = getNextSessionDate(monday, "WEEKLY:MON,WED");
    expect(next.getDay()).toBe(3); // Wednesday
    expect(next.getDate()).toBe(8); // 2025-01-08
  });

  it("returns next Monday when today is Wednesday (MON,WED rule)", () => {
    const next = getNextSessionDate(wednesday, "WEEKLY:MON,WED");
    expect(next.getDay()).toBe(1); // Monday
    expect(next.getDate()).toBe(13); // 2025-01-13
  });

  it("returns same-week next occurrence when available", () => {
    // Rule: TUE,FRI — today is Tuesday → next is Friday this week
    const next = getNextSessionDate(tuesday, "WEEKLY:TUE,FRI");
    expect(next.getDay()).toBe(5); // Friday
    expect(next.getDate()).toBe(10); // 2025-01-10
  });

  it("wraps to next week when today is after all rule days", () => {
    // Rule: MON — today is Friday → next Monday
    const next = getNextSessionDate(friday, "WEEKLY:MON");
    expect(next.getDay()).toBe(1); // Monday
    expect(next.getDate()).toBe(13); // 2025-01-13
  });

  it("wraps past weekend when Saturday and only weekday rule", () => {
    const next = getNextSessionDate(saturday, "WEEKLY:WED");
    expect(next.getDay()).toBe(3); // Wednesday
    expect(next.getDate()).toBe(15); // 2025-01-15
  });

  it("handles Sunday wrapping to the following Monday", () => {
    const next = getNextSessionDate(sunday, "WEEKLY:MON");
    expect(next.getDay()).toBe(1); // Monday
    expect(next.getDate()).toBe(13); // 2025-01-13
  });

  it("preserves the time-of-day from the original date", () => {
    const sessionAt9am = new Date("2025-01-06T09:30:00"); // Monday 9:30
    const next = getNextSessionDate(sessionAt9am, "WEEKLY:WED");
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(30);
  });

  it("returns a date strictly after the input (never same day)", () => {
    // Rule includes Monday, but today is Monday — next MON is next week
    const next = getNextSessionDate(monday, "WEEKLY:MON");
    expect(next.getTime()).toBeGreaterThan(monday.getTime());
    expect(next.getDate()).toBe(13); // next Monday
  });
});

describe("getNextSessionDate() — MONTHLY rules", () => {
  it("returns the 15th when today is the 6th (rule: 1,15)", () => {
    const jan6 = new Date("2025-01-06T10:00:00");
    const next = getNextSessionDate(jan6, "MONTHLY:1,15");
    expect(next.getDate()).toBe(15);
    expect(next.getMonth()).toBe(0); // still January
  });

  it("wraps to next month when today is after last rule day", () => {
    const jan20 = new Date("2025-01-20T10:00:00");
    const next = getNextSessionDate(jan20, "MONTHLY:1,15");
    expect(next.getDate()).toBe(1);
    expect(next.getMonth()).toBe(1); // February
  });

  it("wraps to next month for single-day rule", () => {
    const jan16 = new Date("2025-01-16T10:00:00");
    const next = getNextSessionDate(jan16, "MONTHLY:15");
    expect(next.getDate()).toBe(15);
    expect(next.getMonth()).toBe(1); // February
  });

  it("preserves time-of-day", () => {
    const jan6at18 = new Date("2025-01-06T18:00:00");
    const next = getNextSessionDate(jan6at18, "MONTHLY:15");
    expect(next.getHours()).toBe(18);
    expect(next.getMonth()).toBe(0);
  });

  it("returns date strictly after input (never same day-of-month)", () => {
    const jan15 = new Date("2025-01-15T09:00:00");
    const next = getNextSessionDate(jan15, "MONTHLY:15");
    expect(next.getMonth()).toBe(1); // February
    expect(next.getDate()).toBe(15);
  });
});
