const DAY_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export interface ParsedRecurringRule {
  type: "WEEKLY" | "MONTHLY";
  values: number[];
}

export function parseRecurringRule(rule: string): ParsedRecurringRule {
  const colonIdx = rule.indexOf(":");
  if (colonIdx === -1) throw new Error(`Invalid recurring rule: ${rule}`);

  const type = rule.slice(0, colonIdx).toUpperCase();
  const rest = rule.slice(colonIdx + 1);

  if (type === "WEEKLY") {
    const values = rest
      .split(",")
      .map((d) => DAY_MAP[d.trim().toUpperCase()])
      .filter((d): d is number => d !== undefined);
    if (values.length === 0) throw new Error(`No valid days in WEEKLY rule: ${rule}`);
    return { type: "WEEKLY", values: values.sort((a, b) => a - b) };
  }

  if (type === "MONTHLY") {
    const values = rest
      .split(",")
      .map((d) => parseInt(d.trim(), 10))
      .filter((d) => !isNaN(d) && d >= 1 && d <= 31);
    if (values.length === 0) throw new Error(`No valid days in MONTHLY rule: ${rule}`);
    return { type: "MONTHLY", values: values.sort((a, b) => a - b) };
  }

  throw new Error(`Unknown recurring type: ${type}`);
}

export function getNextSessionDate(currentDate: Date, rule: string): Date {
  const parsed = parseRecurringRule(rule);
  const next = new Date(currentDate);

  if (parsed.type === "WEEKLY") {
    const currentDay = currentDate.getDay();
    // Extend by one week so wrap-around is handled uniformly
    const extended = [...parsed.values, ...parsed.values.map((d) => d + 7)];
    const daysAhead = extended.find((d) => d > currentDay);
    if (daysAhead === undefined) throw new Error("Cannot resolve next weekday");
    next.setDate(next.getDate() + (daysAhead - currentDay));
  } else {
    const currentDayOfMonth = currentDate.getDate();
    const nextDay = parsed.values.find((d) => d > currentDayOfMonth);
    if (nextDay !== undefined) {
      next.setDate(nextDay);
    } else {
      next.setMonth(next.getMonth() + 1);
      next.setDate(parsed.values[0]);
    }
  }

  return next;
}
