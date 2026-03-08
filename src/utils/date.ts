/**
 * Date formatting utilities with Kathmandu timezone support.
 * All dates on the website are displayed in Asia/Kathmandu (GMT+5:45).
 *
 */

import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { adToBS } from './bs-calendar';

const KATHMANDU_TZ = 'Asia/Kathmandu';
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// ── Helpers ──────────────────────────────────────────────────────────────

/** Parse an ISO string, treating bare YYYY-MM-DD as UTC midnight. */
function parse(dateString: string): Date {
  return DATE_ONLY.test(dateString)
    ? new Date(`${dateString}T00:00:00Z`)
    : parseISO(dateString);
}

/** Get the "YYYY-MM-DD" key for a date in Kathmandu timezone. */
function kathmanduKey(dateString: string): string {
  return formatInTimeZone(parse(dateString), KATHMANDU_TZ, 'yyyy-MM-dd');
}

// ── AD formatting ────────────────────────────────────────────────────────

/** Format a date string in Kathmandu timezone (default format: 'PP'). */
export function formatDate(dateString: string | null | undefined, fmt = 'PP'): string {
  if (!dateString) return 'N/A';
  try {
    return formatInTimeZone(parse(dateString), KATHMANDU_TZ, fmt);
  } catch {
    return 'Invalid Date';
  }
}

/** Format a date string with time in Kathmandu timezone. */
export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'PPp');
}

// ── BS conversion ────────────────────────────────────────────────────────

/** Convert an ISO date string → BS date (year, month, date, formatted). */
function convertToBS(dateString: string | null | undefined) {
  if (!dateString) return null;
  try {
    const d = parse(dateString);
    const y = Number(formatInTimeZone(d, KATHMANDU_TZ, 'yyyy'));
    const m = Number(formatInTimeZone(d, KATHMANDU_TZ, 'M'));
    const day = Number(formatInTimeZone(d, KATHMANDU_TZ, 'd'));
    return adToBS(y, m, day);
  } catch {
    return null;
  }
}

// ── Combined AD + BS formatting ──────────────────────────────────────────

/** Format a date as "AD date (BS date)". */
export function formatDateWithBS(dateString: string | null | undefined, fmt = 'PP'): string {
  if (!dateString) return 'N/A';
  const ad = formatDate(dateString, fmt);
  const bs = convertToBS(dateString);
  return bs ? `${ad} (${bs.formatted})` : ad;
}

/** Format a start/end date range with BS dates, or show "Ongoing". */
export function formatCaseDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  ongoingText = 'Ongoing'
): string {
  if (!startDate && !endDate) return 'N/A';
  if (!startDate && endDate) return formatDateWithBS(endDate);
  if (startDate && !endDate) return `${formatDateWithBS(startDate)} - ${ongoingText}`;

  // Both dates exist
  try {
    if (kathmanduKey(startDate!) === kathmanduKey(endDate!)) {
      return formatDateWithBS(startDate);
    }
    return `${formatDateWithBS(startDate)} - ${formatDateWithBS(endDate)}`;
  } catch {
    return `${formatDateWithBS(startDate)} - ${formatDateWithBS(endDate)}`;
  }
}
