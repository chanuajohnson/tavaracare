/**
 * Builds a smart, descriptive filename for downloaded care receipts.
 *
 * Pattern: {YYYY}-{INITIALS}-Receipt-{Month}{startDay}[-{endDay} | -{Month2}{endDay} | -{Year2}-{Month2}{endDay}].{ext}
 *
 * Examples:
 *   Daily:        2026-DN-Receipt-April13.pdf
 *   Same month:   2026-DN-Receipt-April13-19.pdf
 *   Cross month:  2026-DN-Receipt-April28-May04.pdf
 *   Cross year:   2026-DN-Receipt-Dec30-2027-Jan05.pdf
 */

export interface ReceiptFilenameInput {
  caregiverName?: string | null;
  startDate: Date;
  endDate?: Date | null;
  extension?: 'pdf' | 'jpg';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getInitials(name?: string | null): string {
  if (!name) return 'CG';
  const cleaned = name.trim().replace(/[^A-Za-z\s'-]/g, '');
  if (!cleaned) return 'CG';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CG';
  const initials = parts
    .slice(0, 3)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
  return initials || 'CG';
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function sanitize(s: string): string {
  return s.replace(/[^A-Za-z0-9-]/g, '');
}

export function buildReceiptFilename(input: ReceiptFilenameInput): string {
  const { caregiverName, startDate, endDate, extension = 'pdf' } = input;

  const initials = getInitials(caregiverName);
  const startYear = startDate.getFullYear();
  const startMonth = MONTHS[startDate.getMonth()];
  const startDay = pad2(startDate.getDate());

  const sameDay =
    !endDate ||
    (endDate.getFullYear() === startDate.getFullYear() &&
      endDate.getMonth() === startDate.getMonth() &&
      endDate.getDate() === startDate.getDate());

  let rangePart: string;

  if (sameDay) {
    rangePart = `${startMonth}${startDay}`;
  } else {
    const endYear = endDate!.getFullYear();
    const endMonth = MONTHS[endDate!.getMonth()];
    const endDay = pad2(endDate!.getDate());

    if (endYear !== startYear) {
      // Cross-year
      rangePart = `${startMonth}${startDay}-${endYear}-${endMonth}${endDay}`;
    } else if (endDate!.getMonth() !== startDate.getMonth()) {
      // Cross-month, same year
      rangePart = `${startMonth}${startDay}-${endMonth}${endDay}`;
    } else {
      // Same month
      rangePart = `${startMonth}${startDay}-${endDay}`;
    }
  }

  const raw = `${startYear}-${initials}-Receipt-${rangePart}`;
  return `${sanitize(raw)}.${extension}`;
}
