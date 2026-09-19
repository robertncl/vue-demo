import type { Destination } from '@/types/travel'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES: Record<string, string> = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
}

export function currentMonth(): string {
  return MONTHS[new Date().getMonth()]
}

export function currentMonthName(): string {
  return MONTH_NAMES[currentMonth()]
}

export function isInSeason(d: Destination, month = currentMonth()): boolean {
  return d.bestMonths.includes(month)
}

export function noteFor(d: Destination, month = currentMonth()): string {
  return d.monthlyNote[month] || d.tagline
}

/** Ranks a destination for "this month": in-season first, a monthly note
 * second, cheaper as the tiebreaker. */
export function seasonScore(d: Destination, month = currentMonth()): number {
  return (
    (d.bestMonths.includes(month) ? 1000 : 0) + (d.monthlyNote[month] ? 100 : 0) - d.dailyBudget
  )
}
