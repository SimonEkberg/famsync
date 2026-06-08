/** Tiny, locale-independent date formatting helpers (no external deps). */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDay(d: Date): string {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function formatRange(start: Date, end: Date, allDay: boolean): string {
  if (allDay) {
    return `${formatDay(start)} · All day`;
  }
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${formatDay(start)} · ${formatTime(start)}–${formatTime(end)}`;
  }
  return `${formatDay(start)} ${formatTime(start)} → ${formatDay(end)} ${formatTime(end)}`;
}

/** Next top of the hour from `now` (e.g. 14:23 → 15:00). */
export function nextTopOfHour(now: Date): Date {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}
