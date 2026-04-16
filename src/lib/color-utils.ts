/**
 * Color Utils for Sector Identities
 * Generates distinct, vibrant colors for the production sectors.
 */

const SECTOR_COLORS = [
  '#7C3AED', // Violet
  '#2563EB', // Blue
  '#059669', // Emerald
  '#DC2626', // Red
  '#D97706', // Amber
  '#DB2777', // Pink
  '#4B5563', // Slate
  '#0891B2', // Cyan
  '#7C2D12', // Orange-Brown
  '#1E3A8A', // Dark Blue
  '#701A75', // Fuchsia
  '#365314', // Olive
  '#115E59', // Teal
];

/**
 * Gets a random color that is likely not in the existing list.
 * If all colors are used, it returns a random one from the preset.
 */
export function getDistinctColor(existingColors: string[]): string {
  const available = SECTOR_COLORS.filter(c => !existingColors.includes(c));
  
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  
  // Fallback if all used: pick any from the list that was used less recently or simply random
  return SECTOR_COLORS[Math.floor(Math.random() * SECTOR_COLORS.length)];
}
