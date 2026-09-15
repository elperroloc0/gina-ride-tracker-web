const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/** Course-over-ground degrees (0=north) to an 8-point compass label, for the
 * van popup's heading line - "47°" alone means nothing to an operator glancing
 * at a map, "NE" does. */
export function compassLabel(courseDegrees: number): string {
  const normalized = ((courseDegrees % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return DIRECTIONS[index];
}
