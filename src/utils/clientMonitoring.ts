// Client-safe monitoring utilities
// Provides the same interface as server monitoring but without Node.js dependencies

/**
 * Client-safe version of the instrument function.
 * Measures operation duration without server-side dependencies.
 */
export async function instrument<T>(
  op: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    // Log to console in development
    if (import.meta.env?.MODE !== 'production') {
      console.debug(`[monitor] ${op} completed in ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (err) {
    const duration = performance.now() - start;
    
    // Log to console in development
    if (import.meta.env?.MODE !== 'production') {
      console.error(`[monitor] ${op} failed after ${duration.toFixed(2)}ms:`, err);
    }
    
    throw err;
  }
}
