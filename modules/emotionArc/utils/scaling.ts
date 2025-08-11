/**
 * Clamps a number to the [0, 100] range
 * @param n - The number to clamp
 * @returns The clamped value between 0 and 100
 */
export const clamp100 = (n: number): number => {
  if (isNaN(n)) return NaN;
  return Math.max(0, Math.min(100, n));
};

/**
 * Clamps a number to the [0, 1] range
 * @param n - The number to clamp
 * @returns The clamped value between 0 and 1
 */
export const clamp01 = (n: number): number => {
  if (isNaN(n)) return NaN;
  return Math.max(0, Math.min(1, n));
};

/**
 * Converts a 0-1 fraction to percentage display string (for position only)
 * @param fraction - The fraction value (0-1)
 * @returns Formatted percentage string
 */
export const toPercentDisplay = (fraction: number): string => {
  return `${(fraction * 100).toFixed(0)}%`;
};

/**
 * Asserts that a value is within 0-100 range and warns if not
 * @param n - The number to validate
 * @param label - Label for the warning message
 * @returns The original value
 */
export const assert0to100 = (n: number, label = 'value'): number => {
  if (!(n >= 0 && n <= 100)) {
    console.warn(`[scale] ${label} out of range 0–100:`, n);
  }
  return n;
};

/**
 * Validates that a value is within the [0, 100] range
 * @param n - The number to validate
 * @returns true if the value is within range, false otherwise
 */
export const isValid100 = (n: number): boolean => {
  return !isNaN(n) && n >= 0 && n <= 100;
};

/**
 * Validates that a value is within the [0, 1] range
 * @param n - The number to validate
 * @returns true if the value is within range, false otherwise
 */
export const isValid01 = (n: number): boolean => {
  return !isNaN(n) && n >= 0 && n <= 1;
};

/**
 * Converts a 0-1 value to 0-100 scale for display
 * @param n - The value in 0-1 range
 * @returns The value converted to 0-100 range
 */
export const toPercentage = (n: number): number => {
  return clamp100(n * 100);
};

/**
 * Converts a 0-100 value to 0-1 scale for internal calculations
 * @param n - The value in 0-100 range
 * @returns The value converted to 0-1 range
 */
export const toDecimal = (n: number): number => {
  return clamp01(n / 100);
};

/**
 * Formats a 0-100 value as a percentage string
 * @param n - The value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (n: number, decimals: number = 0): string => {
  const clamped = clamp100(n);
  return `${clamped.toFixed(decimals)}%`;
};

/**
 * Formats a 0-1 position value as a percentage string
 * @param n - The position value (0-1)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPosition = (n: number, decimals: number = 0): string => {
  const clamped = clamp01(n);
  return `${(clamped * 100).toFixed(decimals)}%`;
};
