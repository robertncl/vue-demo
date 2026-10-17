/**
 * Calendar dates as ISO "YYYY-MM-DD" strings, with arithmetic done on whole
 * UTC days so daylight saving can never shift a date by one.
 */

const DAY_MS = 86_400_000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  // Rejects impossible dates such as 2026-02-30, which Date would roll over.
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

/** Days since 1970-01-01. */
export function toEpochDay(iso: string): number {
  return Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY_MS)
}

export function fromEpochDay(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  return fromEpochDay(toEpochDay(iso) + days)
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return toEpochDay(to) - toEpochDay(from)
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay()
}

/** 1 = January … 12 = December. */
export function monthOf(iso: string): number {
  return Number(iso.slice(5, 7))
}

/** The calendar date a `Date` falls on in the viewer's own time zone. */
export function localIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** The first day of the month `offset` months after the one `iso` is in. */
export function startOfMonth(iso: string, offset = 0): string {
  const year = Number(iso.slice(0, 4))
  const month = Number(iso.slice(5, 7)) - 1 + offset
  const date = new Date(Date.UTC(year, month, 1))
  return date.toISOString().slice(0, 10)
}

export function daysInMonth(iso: string): number {
  return daysBetween(startOfMonth(iso), startOfMonth(iso, 1))
}

/** Converts wall minutes (see FlightSegment) to the ISO date they fall on. */
export function wallDate(wallMinutes: number): string {
  return fromEpochDay(Math.floor(wallMinutes / 1440))
}

/** "HH:mm" on the 24-hour clock, the format <input type="time"> uses. */
export function wallClock(wallMinutes: number): string {
  const minutes = ((wallMinutes % 1440) + 1440) % 1440
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

/** Hour of the local day, 0–23.99, for the time-of-day filters. */
export function wallHour(wallMinutes: number): number {
  return (((wallMinutes % 1440) + 1440) % 1440) / 60
}
