/** Two-letter initials for an Avatar chip, from a "First Last" name - used anywhere a child's full name needs to become a chip. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}
