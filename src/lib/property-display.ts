/**
 * Display helpers for property fields that carry a default unit.
 */

/**
 * Renders a vacant property's frontage with its default "ft" suffix.
 * - Values already suffixed ("25 ft" / "25ft") are returned unchanged.
 * - Bare integers ("25") get " ft" appended.
 * - Non-numeric legacy values ("Yes"/"No") are returned as-is.
 */
export function formatFrontage(value?: string | number | null): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/ft\.?$/i.test(raw)) return raw;
  if (/^\d+$/.test(raw)) return `${raw} ft`;
  return raw;
}
