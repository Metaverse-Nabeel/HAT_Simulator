import { format, addHours } from "date-fns";

/**
 * Formats a date to Pakistan Standard Time (PST, UTC+5)
 * @param date The date to format
 * @param formatStr date-fns format string
 * @returns Formatted string
 */
export function formatPST(date: Date | string | number, formatStr: string = "MMM d, h:mm a"): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;

    // Convert UTC to PST (UTC + 5)
    // Note: This is a simple offset. For real production with DST, we might use luxon or Intl.
    // But for HAT Simulator, a fixed +5 offset is generally what's expected in Pakistan.
    const pstOffset = 5;
    const pstDate = addHours(d, pstOffset);

    return format(pstDate, formatStr) + " PST";
}
